import { run } from "../utils/exec.js";
import { log, ok } from "../utils/logger.js";

export async function scaffold(
  projectName,
  packageManager
) {
  const pm = packageManager === "npx" ? "npm" : packageManager;
  log(`Creating Turborepo: ${projectName}`);

  if (pm === "npm" || pm === "yarn") {
    await run("npx", [
      "create-turbo@latest",
      projectName,
      "--package-manager", pm,
      "--skip-install"
    ]);
  } else if (pm === "bun") {
    await run("bunx", [
      "create-turbo@latest",
      projectName,
      "--package-manager", "bun",
      "--skip-install"
    ]);
  } else {
    await run("pnpm", [
      "dlx",
      "create-turbo@latest",
      projectName,
      "--package-manager", "pnpm",
      "--skip-install"
    ]);
  }

  ok("Turborepo created");
}