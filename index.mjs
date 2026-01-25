#!/usr/bin/env node

import { createProject } from "./commands/create.mjs";
import { addApp } from "./commands/add.mjs";
import { renameApp } from "./commands/rename.mjs";
import { showHelp } from "./commands/help.mjs";
import color from "picocolors";

/**
 * Main entry point for the create-cf-stack CLI.
 * Handles command dispatching based on process arguments.
 * @returns {Promise<void>}
 */
async function main() {
  console.clear();

  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "add": {
      const appName = args[1];
      if (!appName) {
        console.error(
          color.red(
            "❌ Please specify a name for the new app: create-cf-stack add [name]",
          ),
        );
        process.exit(1);
      }
      await addApp(appName);
      break;
    }
    case "rename": {
      const oldName = args[1];
      const newName = args[2];
      if (!oldName || !newName) {
        console.error(
          color.red(
            "❌ Usage: create-cf-stack rename [current-name] [new-name]",
          ),
        );
        process.exit(1);
      }
      await renameApp(oldName, newName);
      break;
    }
    case "help":
    case "--help":
    case "-h": {
      showHelp();
      break;
    }
    default: {
      await createProject();
      break;
    }
  }
}

main().catch(console.error);
