import { run } from "../utils/exec.js";
import { log, ok } from "../utils/logger.js";

export async function scaffold(
  projectName,
  packageManager
) {
  log(`Creating Turborepo: ${projectName}`);

  await run(
    packageManager,
    [
      "dlx",
      "create-turbo@latest",
      projectName,
      "--package-manager",
      packageManager,
      "--skip-install"
    ]
  );

  ok("Turborepo created");
}