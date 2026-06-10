import fs from "fs-extra";
import path from "path";

import { run } from "../utils/exec.js";
import { log, ok, warn } from "../utils/logger.js";

function shadcnBinary(pm) {
  if (pm === "bun") return "bunx --bun ${ver}";
  if (pm === "npm" || pm === "yarn") return "npx ${ver}";
  return `${pm} dlx \${ver}`;
}

const GLOBALS_CSS = `@import "tailwindcss";
@source "../../src/**/*.{ts,tsx}";
@plugin "tailwindcss-animate";

@theme {
  --radius: 0.5rem;

  --color-background: hsl(0 0% 100%);
  --color-foreground: hsl(222.2 84% 4.9%);
  --color-card: hsl(0 0% 100%);
  --color-card-foreground: hsl(222.2 84% 4.9%);
  --color-popover: hsl(0 0% 100%);
  --color-popover-foreground: hsl(222.2 84% 4.9%);
  --color-primary: hsl(222.2 47.4% 11.2%);
  --color-primary-foreground: hsl(210 40% 98%);
  --color-secondary: hsl(210 40% 96.1%);
  --color-secondary-foreground: hsl(222.2 47.4% 11.2%);
  --color-muted: hsl(210 40% 96.1%);
  --color-muted-foreground: hsl(215.4 16.3% 46.9%);
  --color-accent: hsl(210 40% 96.1%);
  --color-accent-foreground: hsl(222.2 47.4% 11.2%);
  --color-destructive: hsl(0 84.2% 60.2%);
  --color-destructive-foreground: hsl(210 40% 98%);
  --color-border: hsl(214.3 31.8% 91.4%);
  --color-input: hsl(214.3 31.8% 91.4%);
  --color-ring: hsl(222.2 84% 4.9%);
}

.dark {
  --color-background: hsl(222.2 84% 4.9%);
  --color-foreground: hsl(210 40% 98%);
  --color-card: hsl(222.2 84% 4.9%);
  --color-card-foreground: hsl(210 40% 98%);
  --color-popover: hsl(222.2 84% 4.9%);
  --color-popover-foreground: hsl(210 40% 98%);
  --color-primary: hsl(210 40% 98%);
  --color-primary-foreground: hsl(222.2 47.4% 11.2%);
  --color-secondary: hsl(217.2 32.6% 17.5%);
  --color-secondary-foreground: hsl(210 40% 98%);
  --color-muted: hsl(217.2 32.6% 17.5%);
  --color-muted-foreground: hsl(215 20.2% 65.1%);
  --color-accent: hsl(217.2 32.6% 17.5%);
  --color-accent-foreground: hsl(210 40% 98%);
  --color-destructive: hsl(0 62.8% 30.6%);
  --color-destructive-foreground: hsl(210 40% 98%);
  --color-border: hsl(217.2 32.6% 17.5%);
  --color-input: hsl(217.2 32.6% 17.5%);
  --color-ring: hsl(212.7 26.8% 83.9%);
}

@layer base {
  * { border-color: var(--color-border); }
  body {
    background-color: var(--color-background);
    color: var(--color-foreground);
  }
}
`;

const UTILS_TS = `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;

function shadcnAddScript(pm) {
  return `#!/usr/bin/env node
// packages/ui/scripts/shadcn-add.mjs
// Wraps npx shadcn@latest add and automatically:
//   • Fixes @/ imports → @repo/ui/...
//   • Keeps src/index.ts in sync with all files in src/components/ui/

import { execSync } from "child_process";
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join, basename, extname } from "path";

const cwd = process.cwd();
const UI_ROOT = existsSync(join(cwd, "components.json"))
  ? cwd
  : join(cwd, "packages/ui");

const COMP_DIR = join(UI_ROOT, "src/components/ui");
const INDEX = join(UI_ROOT, "src/index.ts");
const LIB_DIR = join(UI_ROOT, "src/lib");

const components = process.argv.slice(2);
if (components.length === 0) {
  console.error("Usage: yarn ui:add <component> [component2 ...]");
  console.error("  e.g. yarn ui:add button");
  console.error("  e.g. yarn ui:add dialog dropdown-menu toast");
  process.exit(1);
}

const GREEN = "\\x1b[32m";
const BLUE = "\\x1b[34m";
const YELLOW = "\\x1b[33m";
const RESET = "\\x1b[0m";

const _log = (msg) => console.log(\`\${BLUE}[shadcn-add]\${RESET} \${msg}\`);
const _ok = (msg) => console.log(\`\${GREEN}  ✓\${RESET} \${msg}\`);
const _warn = (msg) => console.log(\`\${YELLOW}  !\${RESET} \${msg}\`);

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function checkNetwork() {
  try {
    execSync(
      "node -e \\"require('https').get('https://registry.npmjs.org', r => process.exit(0)).on('error', () => process.exit(1))\\"",
      { timeout: 5000, stdio: "pipe" }
    );
    return true;
  } catch {
    return false;
  }
}

async function runShadcn() {
  const versions = ["shadcn@latest", "shadcn@4.10.0"];
  const RETRIES = 3;
  const RETRY_DELAY = 3000;

  for (const ver of versions) {
    const cmd = \`${shadcnBinary(pm)} add \${components.join(" ")} --yes --cwd "\${UI_ROOT}"\`;

    for (let attempt = 1; attempt <= RETRIES; attempt++) {
      _log(\`Attempt \${attempt}/\${RETRIES} — \${cmd}\`);

      if (!checkNetwork()) {
        console.error(\`\\n  ✗  No internet connection (attempt \${attempt}/\${RETRIES})\`);
        if (attempt < RETRIES) {
          console.log(\`  Retrying in \${RETRY_DELAY / 1000}s…\`);
          await sleep(RETRY_DELAY);
          continue;
        }
        break;
      }

      try {
        execSync(cmd, { cwd: UI_ROOT, stdio: "inherit" });
        _ok(\`shadcn add succeeded with \${ver}\`);
        return;
      } catch (err) {
        const msg = err.stderr?.toString() || err.message || "";
        const isNet = /EAI_AGAIN|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|network/i.test(msg);
        if (isNet && attempt < RETRIES) {
          console.log(\`\\n  ✗  Network error. Retrying in \${RETRY_DELAY / 1000}s…\\n\`);
          await sleep(RETRY_DELAY);
        } else if (isNet) {
          console.log(\`\\n  ✗  Network error persists after \${RETRIES} attempts.\`);
          break;
        } else {
          console.error(\`\\n  ✗  shadcn error:\\n\${msg}\`);
          process.exit(1);
        }
      }
    }

    if (ver === "shadcn@latest") {
      _warn("shadcn@latest failed — trying fallback shadcn@4.10.0 …");
    }
  }

  console.error(\`\\n  ✗  Could not add components. Once online, run:\\n\\n    cd packages/ui && yarn ui:add \${components.join(" ")}\\n  \`);
  process.exit(1);
}

await runShadcn();

// Install missing peer deps
_log("Installing any missing peer dependencies...");
try {
  execSync(\`\${pm === "npm" ? "npm install" : pm + " install"}\`, { cwd: UI_ROOT, stdio: "inherit" });
  _ok("Peer dependencies installed");
} catch {
  _warn("Install failed — you may need to run it manually");
}

// Ensure lib directory exists
if (!existsSync(LIB_DIR)) {
  execSync(\`mkdir -p "\${LIB_DIR}"\`);
}

// Ensure utils.ts exists
const utilsPath = join(LIB_DIR, "utils.ts");
if (!existsSync(utilsPath)) {
  const utilsTs = \`import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
\`;
  writeFileSync(utilsPath, utilsTs, "utf8");
  _ok("utils.ts created");
}

// Fix @/ imports
_log("Fixing @/ imports → @repo/ui/...");

const replacements = [
  [/@\\/lib\\/utils/g, "@repo/ui/lib/utils"],
  [/@\\/components\\//g, "@repo/ui/components/"],
  [/@\\/hooks\\//g, "@repo/ui/hooks/"],
  [/@\\/lib\\//g, "@repo/ui/lib/"],
];

function fixImportsInDir(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      fixImportsInDir(full);
      continue;
    }
    const ext = extname(entry.name);
    if (ext !== ".ts" && ext !== ".tsx") continue;

    let src = readFileSync(full, "utf8");
    let changed = false;
    for (const [pattern, replacement] of replacements) {
      if (pattern.test(src)) {
        src = src.replace(pattern, replacement);
        changed = true;
      }
      pattern.lastIndex = 0;
    }
    if (changed) {
      writeFileSync(full, src, "utf8");
      _ok(\`Fixed imports: \${entry.name}\`);
    }
  }
}

fixImportsInDir(COMP_DIR);

// Rebuild index.ts barrel
_log("Syncing src/index.ts ...");

function collectExports(dir, rel = "./components/ui") {
  const lines = [];
  if (!existsSync(dir)) return lines;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    const relPath = \`\${rel}/\${entry.name}\`;
    if (entry.isDirectory()) {
      lines.push(...collectExports(full, relPath));
      continue;
    }
    const ext = extname(entry.name);
    if (ext !== ".ts" && ext !== ".tsx") continue;
    const exportPath = relPath.replace(/\\.(ts|tsx)$/, "");
    lines.push(\`export * from "\${exportPath}";\`);
  }
  return lines;
}

const exportLines = collectExports(COMP_DIR);
const header = \`// Auto-managed by scripts/shadcn-add.mjs — do not edit manually
\`;
const content = header + exportLines.sort().join("\\n") + "\\n";
writeFileSync(INDEX, content, "utf8");
_ok(\`src/index.ts updated (\${exportLines.length} export\${exportLines.length !== 1 ? "s" : ""})\`);

console.log("");
console.log(\`\${GREEN}✅  Done!\${RESET}\`);
console.log("");
console.log("Use in any app:");
for (const comp of components) {
  const name = comp.split("-").map(p => p[0].toUpperCase() + p.slice(1)).join("");
  console.log(\`  import { \${name} } from "@repo/ui"\`);
}
console.log("");
`;
}

export async function setupUI(projectRoot, packageManager = "npm") {
  const pm = packageManager === "npx" ? "npm" : packageManager;
  log("Configuring UI (Tailwind v4 + shadcn/ui)");

  const uiDir = path.join(projectRoot, "packages/ui");
  const appsDir = path.join(projectRoot, "apps");

  // ── Ensure folder structure ────────────────────────────────────────
  await fs.ensureDir(path.join(uiDir, "src/components/ui"));
  await fs.ensureDir(path.join(uiDir, "src/lib"));
  await fs.ensureDir(path.join(uiDir, "src/styles"));
  await fs.ensureDir(path.join(uiDir, "src/hooks"));
  await fs.ensureDir(path.join(uiDir, "scripts"));

  // ── Install Tailwind v4 + shadcn deps in packages/ui ────────────────
  log("Installing Tailwind v4 & shadcn dependencies");
  const uiAdd = pm === "npm" ? ["install"] : ["add"];
  try {
    await run(pm, [...uiAdd, "class-variance-authority", "clsx", "tailwind-merge", "lucide-react", "tailwindcss-animate"], uiDir);
    if (pm === "npm") {
      await run(pm, ["install", "-D", "tailwindcss", "postcss"], uiDir);
    } else {
      await run(pm, ["add", "-D", "tailwindcss", "postcss"], uiDir);
    }
    ok("Tailwind v4 & shadcn deps installed");
  } catch {
    warn("Could not install deps — run install manually");
  }

  // ── Install @tailwindcss/postcss in apps ────────────────────────────
  for (const app of ["docs", "web"]) {
    const appDir = path.join(appsDir, app);
    if (!await fs.pathExists(appDir)) continue;
    log(`apps/${app}: adding @tailwindcss/postcss`);
    try {
      if (pm === "npm") {
        await run(pm, ["install", "-D", "@tailwindcss/postcss"], appDir);
      } else {
        await run(pm, ["add", "-D", "@tailwindcss/postcss"], appDir);
      }
      ok(`apps/${app}: @tailwindcss/postcss added`);
    } catch {
      warn(`apps/${app}: could not install — run install manually`);
    }
  }

  // ── Write globals.css (Tailwind v4) ─────────────────────────────────
  await fs.writeFile(path.join(uiDir, "src/styles/globals.css"), GLOBALS_CSS, "utf8");
  ok("src/styles/globals.css written");

  // ── Write utils.ts ──────────────────────────────────────────────────
  await fs.writeFile(path.join(uiDir, "src/lib/utils.ts"), UTILS_TS, "utf8");
  ok("src/lib/utils.ts written");

  // ── Write index.ts placeholder ──────────────────────────────────────
  await fs.writeFile(
    path.join(uiDir, "src/index.ts"),
    "// Auto-managed by scripts/shadcn-add.mjs — do not edit manually\n",
    "utf8"
  );
  ok("src/index.ts placeholder");

  // ── Write components.json ───────────────────────────────────────────
  await fs.writeJson(
    path.join(uiDir, "components.json"),
    {
      $schema: "https://ui.shadcn.com/schema.json",
      style: "default",
      rsc: true,
      tsx: true,
      tailwind: {
        config: "",
        css: "src/styles/globals.css",
        baseColor: "slate",
        cssVariables: true
      },
      aliases: {
        components: "@/components",
        utils: "@/lib/utils",
        ui: "@/components/ui",
        lib: "@/lib",
        hooks: "@/hooks"
      }
    },
    { spaces: 2 }
  );
  ok("components.json written");

  // ── Write shadcn-add.mjs ───────────────────────────────────────────
  await fs.writeFile(
    path.join(uiDir, "scripts/shadcn-add.mjs"),
    shadcnAddScript(pm),
    "utf8"
  );
  await fs.chmod(path.join(uiDir, "scripts/shadcn-add.mjs"), 0o755);
  ok("scripts/shadcn-add.mjs written");

  // ── Patch packages/ui/tsconfig.json ─────────────────────────────────
  const uiTsconfigPath = path.join(uiDir, "tsconfig.json");
  if (await fs.pathExists(uiTsconfigPath)) {
    const ts = await fs.readJson(uiTsconfigPath);
    delete ts.compilerOptions?.baseUrl;
    ts.compilerOptions = {
      ...ts.compilerOptions,
      rootDir: "./src",
      ignoreDeprecations: "5.0",
      paths: {
        "@repo/ui": ["./src/index.ts"],
        "@repo/ui/*": ["./src/*"],
        "@/*": ["./src/*"]
      }
    };
    ts.include = ["src/**/*"];
    ts.exclude = ["node_modules"];
    await fs.writeJson(uiTsconfigPath, ts, { spaces: 2 });
    ok("packages/ui/tsconfig.json patched");
  }

  // ── Patch packages/ui/package.json ──────────────────────────────────
  const uiPkgPath = path.join(uiDir, "package.json");
  const uiPkg = await fs.readJson(uiPkgPath);
  uiPkg.exports = {
    ".": "./src/index.ts",
    "./components/*": "./src/components/ui/*.tsx",
    "./lib/utils": "./src/lib/utils.ts",
    "./styles": "./src/styles/globals.css",
    "./hooks/*": "./src/hooks/*.ts"
  };
  uiPkg.scripts = {
    ...(uiPkg.scripts || {}),
    "ui:add": "node scripts/shadcn-add.mjs",
    "ui": "node scripts/shadcn-add.mjs"
  };
  await fs.writeJson(uiPkgPath, uiPkg, { spaces: 2 });
  ok("packages/ui/package.json patched");

  // ── Patch ROOT package.json with ui:add script ─────────────────────
  const rootPkgPath = path.join(projectRoot, "package.json");
  const rootPkg = await fs.readJson(rootPkgPath);

  let workspaceCmd;
  if (pm === "npm") {
    workspaceCmd = `npm -w @repo/ui run ui:add`;
  } else if (pm === "yarn") {
    workspaceCmd = `yarn workspace @repo/ui ui:add`;
  } else {
    workspaceCmd = `${pm} --filter @repo/ui ui:add`;
  }

  rootPkg.scripts = {
    ...(rootPkg.scripts || {}),
    "ui": workspaceCmd,
    "ui:add": workspaceCmd
  };
  await fs.writeJson(rootPkgPath, rootPkg, { spaces: 2 });
  ok("Root package.json: ui:add script added");

  // ── Configure apps ─────────────────────────────────────────────────
  for (const app of ["docs", "web"]) {
    const appDir = path.join(appsDir, app);
    if (!await fs.pathExists(appDir)) continue;
    log(`Configuring apps/${app} …`);

    // Add @repo/ui dependency
    const appPkgPath = path.join(appDir, "package.json");
    if (await fs.pathExists(appPkgPath)) {
      const appPkg = await fs.readJson(appPkgPath);
      appPkg.dependencies = { ...(appPkg.dependencies || {}), "@repo/ui": "workspace:*" };
      await fs.writeJson(appPkgPath, appPkg, { spaces: 2 });
      ok(`  @repo/ui dependency added`);
    }

    // postcss.config.mjs
    await fs.writeFile(
      path.join(appDir, "postcss.config.mjs"),
      `const config = { plugins: { "@tailwindcss/postcss": {} } };\nexport default config;\n`,
      "utf8"
    );
    ok("  postcss.config.mjs written");

    // next.config.js
    await fs.writeFile(
      path.join(appDir, "next.config.js"),
      `/** @type {import('next').NextConfig} */\nconst nextConfig = { transpilePackages: ["@repo/ui"] };\nexport default nextConfig;\n`,
      "utf8"
    );
    ok("  next.config.js written");

    // Remove old globals.css
    const oldGlobals = path.join(appDir, "app/globals.css");
    if (await fs.pathExists(oldGlobals)) {
      await fs.remove(oldGlobals);
      ok("  removed old globals.css");
    }

    // Patch layout.tsx
    const layoutPath = path.join(appDir, "app/layout.tsx");
    if (await fs.pathExists(layoutPath)) {
      let layout = await fs.readFile(layoutPath, "utf8");
      layout = layout.replace(/import\s+["']\.\/globals\.css["'];\s*/g, "");
      if (!layout.includes("@repo/ui/styles")) {
        layout = `import "@repo/ui/styles";\n${layout}`;
      }
      await fs.writeFile(layoutPath, layout, "utf8");
      ok("  layout.tsx: @repo/ui/styles imported");
    }

    // env.d.ts
    await fs.writeFile(
      path.join(appDir, "env.d.ts"),
      `declare module '@repo/ui/styles';\n`,
      "utf8"
    );
    ok("  env.d.ts created");
  }

  // ── Remove old tailwind.config.ts if present ───────────────────────
  const oldTailwindConfig = path.join(uiDir, "tailwind.config.ts");
  if (await fs.pathExists(oldTailwindConfig)) {
    await fs.remove(oldTailwindConfig);
  }

  ok("UI configured");
}
