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
    options.packageManager || "yarn"
  );

  if (options.install !== false) {
    await installDeps(root);
  }

  await setupUI(root);

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

  console.log(
    `  cd ${projectName}`
  );

  console.log(
    `  yarn dev`
  );

  console.log("");

  console.log(
    pc.bold(
      "Add shadcn components:"
    )
  );

  console.log(
    `  yarn ui:add accordion`
  );

  console.log(
    `  yarn ui:add dialog dropdown-menu`
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