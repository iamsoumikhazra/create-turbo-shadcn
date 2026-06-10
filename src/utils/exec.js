import { execa } from "execa";

export async function run(cmd, args, cwd = process.cwd()) {
  await execa(cmd, args, {
    cwd,
    stdio: "inherit"
  });
}
