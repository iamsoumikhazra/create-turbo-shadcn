#!/usr/bin/env node

import { program } from "commander";
import createApp from "../src/index.js";
import packageJson from "../package.json" with { type: "json" };

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
    "yarn"
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