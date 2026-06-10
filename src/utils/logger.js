import pc from "picocolors";

export const log = (msg) =>
  console.log(pc.cyan(`[turbo-shadcn] ${msg}`));

export const ok = (msg) =>
  console.log(pc.green(`✓ ${msg}`));

export const warn = (msg) =>
  console.log(pc.yellow(`⚠ ${msg}`));

export const error = (msg) =>
  console.log(pc.red(`✖ ${msg}`));
