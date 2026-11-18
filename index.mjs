#!/usr/bin/env node

import color from "picocolors";
import { createProject } from "#commands/create.mjs";
import { addApp } from "#commands/add.mjs";
import { renameApp } from "#commands/rename.mjs";
import { showHelp } from "#commands/help.mjs";
import { ValidationError } from "#errors/common/validation.error.mjs";
import { normalizeError } from "#errors/common/normalize-error.mjs";

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
        throw new ValidationError(
          "Please specify a name for the new app: create-cf-stack add <name>",
        );
      }
      await addApp(appName);
      break;
    }
    case "rename": {
      const oldName = args[1];
      const newName = args[2];
      if (!oldName || !newName) {
        throw new ValidationError(
          "Usage: create-cf-stack rename <current-name> <new-name>",
        );
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

main().catch((caughtError) => {
  const normalizedError = normalizeError(caughtError);
  console.error(color.red(`❌ ${normalizedError.message}`));

  if (!normalizedError.silent && normalizedError.cause) {
    console.error(color.gray(String(normalizedError.cause)));
  }

  process.exit(normalizedError.exitCode);
});
