import fs from "fs-extra";
import path from "path";

import { log, ok } from "../utils/logger.js";

function shadcnCmd(pm) {
  if (pm === "bun") return "bunx --bun shadcn@latest";
  if (pm === "npm" || pm === "yarn") return "npx shadcn@latest";
  return `${pm} dlx shadcn@latest`;
}

export async function setupUI(projectRoot, packageManager = "npm") {
  log("Configuring UI");

  const pm = packageManager === "npx" ? "npm" : packageManager;

  const uiDir = path.join(
    projectRoot,
    "packages/ui"
  );

  // folders
  await fs.ensureDir(
    path.join(uiDir, "src/components/ui")
  );

  await fs.ensureDir(
    path.join(uiDir, "scripts")
  );

  // components.json
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
        components: "src/components",
        utils: "src/lib/utils",
        ui: "src/components/ui",
        lib: "src/lib",
        hooks: "src/hooks"
      }
    },
    { spaces: 2 }
  );

  // create shadcn-add.mjs INSIDE GENERATED APP
  await fs.writeFile(
    path.join(
      uiDir,
      "scripts/shadcn-add.mjs"
    ),
`#!/usr/bin/env node

import { execSync } from "child_process";

const components = process.argv.slice(2);

if (!components.length) {
  console.error("No components provided");
  process.exit(1);
}

execSync(
  \`${shadcnCmd(pm)} add \${components.join(" ")} --yes\`,
  {
    stdio: "inherit"
  }
);
`
  );

  // chmod
  await fs.chmod(
    path.join(
      uiDir,
      "scripts/shadcn-add.mjs"
    ),
    0o755
  );

  // patch packages/ui/package.json
  const uiPkgPath = path.join(
    uiDir,
    "package.json"
  );

  const uiPkg = await fs.readJson(
    uiPkgPath
  );

  uiPkg.scripts = {
    ...(uiPkg.scripts || {}),
    "ui": "node scripts/shadcn-add.mjs"
  };

  await fs.writeJson(
    uiPkgPath,
    uiPkg,
    { spaces: 2 }
  );

  // patch ROOT package.json
  const rootPkgPath = path.join(
    projectRoot,
    "package.json"
  );

  const rootPkg = await fs.readJson(
    rootPkgPath
  );

  const workspaceCmd = pm === "npm"
    ? `npm -w @repo/ui run ui`
    : pm === "yarn"
    ? `yarn workspace @repo/ui ui`
    : `${pm} --filter @repo/ui ui`;

  rootPkg.scripts = {
    ...(rootPkg.scripts || {}),
    "ui": workspaceCmd
  };

  await fs.writeJson(
    rootPkgPath,
    rootPkg,
    { spaces: 2 }
  );

  ok("UI configured");
}