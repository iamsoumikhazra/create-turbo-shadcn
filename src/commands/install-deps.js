import { run } from "../utils/exec.js";
import { log, ok } from "../utils/logger.js";

export async function installDeps(projectRoot) {
  log("Installing dependencies");

  await run("yarn", ["install"], projectRoot);

  ok("Dependencies installed");
}
