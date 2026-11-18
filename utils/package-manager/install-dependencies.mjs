import { confirm, isCancel, cancel, spinner } from "@clack/prompts";
import { execa } from "execa";
import { InternalCliError } from "#errors/common/internal-cli.error.mjs";

/**
 * Prompts the user to install dependencies with pnpm and executes the install.
 * @param {string} targetDirectory - Directory where `pnpm install` should run.
 * @param {object} [options] - Prompt behavior options.
 * @param {boolean} [options.exitOnCancel=true] - Whether cancelling exits the CLI.
 * @returns {Promise<boolean>} True if dependencies were installed, false otherwise.
 */
export async function installDependencies(
  targetDirectory,
  { exitOnCancel = true } = {},
) {
  const shouldInstall = await confirm({
    message: "📦 Do you want to install dependencies now? (Recommended)",
  });

  if (isCancel(shouldInstall)) {
    if (exitOnCancel) {
      cancel("❌ Operation cancelled.");
      process.exit(0);
    }
    return false;
  }

  if (!shouldInstall) {
    return false;
  }

  const installSpinner = spinner();
  installSpinner.start("☕ Grab a coffee, this will take a few seconds...");

  try {
    await execa("pnpm", ["install"], { cwd: targetDirectory });
    installSpinner.stop("🎉 Dependencies installed!");
    return true;
  } catch (caughtError) {
    installSpinner.stop("💥 Failed to install dependencies.");
    throw new InternalCliError(
      "Could not install dependencies with pnpm. Please run `pnpm install` manually.",
      {
        details: { targetDirectory },
        cause: caughtError,
      },
    );
  }
}
