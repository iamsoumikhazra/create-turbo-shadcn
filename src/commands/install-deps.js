import { run } from "../utils/exec.js";
import { log, ok } from "../utils/logger.js";

export async function installDeps(projectRoot, packageManager = "npm") {
  const pm = packageManager === "npx" ? "npm" : packageManager;
  log("Installing dependencies");

  await run(pm, ["install"], projectRoot);

  ok("Dependencies installed");
}
