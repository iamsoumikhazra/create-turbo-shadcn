import fs from "fs-extra";
import path from "path";

import { log, ok } from "../utils/logger.js";

export async function setupUI(projectRoot) {
  log("Configuring UI");

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
        components: "@/components",
        utils: "@/lib/utils",
        ui: "@/components/ui",
        lib: "@/lib",
        hooks: "@/hooks"
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
  \`npx shadcn@latest add \${components.join(" ")} --yes\`,
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
    "ui:add": "node scripts/shadcn-add.mjs"
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

  rootPkg.scripts = {
    ...(rootPkg.scripts || {}),
    "ui:add":
      "yarn workspace @repo/ui ui:add"
  };

  await fs.writeJson(
    rootPkgPath,
    rootPkg,
    { spaces: 2 }
  );

  ok("UI configured");
}