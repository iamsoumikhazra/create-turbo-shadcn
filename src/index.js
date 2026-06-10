import path from "path";
import pc from "picocolors";

import { scaffold } from "./commands/scaffold.js";
import { installDeps } from "./commands/install-deps.js";
import { setupUI } from "./commands/setup-ui.js";

export default async function createApp(
  projectName,
  options = {}
) {
  const root = path.resolve(projectName);

  await scaffold(
    projectName,
    options.packageManager || "npm"
  );

  if (options.install !== false) {
    await installDeps(root, options.packageManager || "npm");
  }

  await setupUI(root, options.packageManager || "npm");

  console.log("");

  console.log(
    pc.green(
      pc.bold(
        "🎉 Done! Turborepo + shadcn/ui ready."
      )
    )
  );

  console.log("");

  console.log(pc.bold("Next steps:"));

  const pm = (options.packageManager === "npx" ? "npm" : options.packageManager) || "npm";
  const runCmd = pm === "npm" ? `npm run dev` : `${pm} dev`;
  const uiCmd = pm === "npm" ? "npm run ui" : `${pm} ui`;

  console.log(
    `  cd ${projectName}`
  );

  console.log(
    `  ${runCmd}`
  );

  console.log("");

  console.log(
    pc.bold(
      "Add shadcn components:"
    )
  );

  console.log(
    `  ${uiCmd} accordion`
  );

  console.log(
    `  ${uiCmd} dialog dropdown-menu`
  );

  console.log("");

  console.log(
    pc.bold(
      "Import components anywhere:"
    )
  );

  console.log(
    `  import { Accordion } from "@repo/ui"`
  );

  console.log("");
}