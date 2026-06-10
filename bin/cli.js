#!/usr/bin/env node

import { program } from "commander";
import createApp from "../src/index.js";
import packageJson from "../package.json" with { type: "json" };

function detectPackageManager() {
  const ua = process.env.npm_config_user_agent;
  if (!ua) return "npm";
  if (ua.startsWith("yarn/")) return "yarn";
  if (ua.startsWith("pnpm/")) return "pnpm";
  if (ua.startsWith("bun/")) return "bun";
  return "npm";
}

program
  .name("create-turbo-shadcn")
  .description(
    "Scaffold Turborepo + shadcn/ui monorepos"
  )
  .version(packageJson.version)

  .argument(
    "<project-name>",
    "name of project"
  )

  .option(
    "-p, --package-manager <manager>",
    "package manager",
    detectPackageManager()
  )

  .option(
    "-t, --template <template>",
    "template type",
    "default"
  )

  .option(
    "--no-install",
    "skip dependency installation"
  )

  .option(
    "--git",
    "initialize git repository",
    true
  )

  .option(
    "-y, --yes",
    "skip prompts"
  )

  .action(async (projectName, options) => {
    await createApp(projectName, options);
  });

program.parse();