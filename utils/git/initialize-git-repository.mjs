import { confirm, isCancel, cancel, spinner } from "@clack/prompts";
import { execa } from "execa";

/**
 * Prompts the user to initialize a Git repository and creates an initial commit.
 * @param {string} targetDirectory - Directory where Git should be initialized.
 * @returns {Promise<boolean>} True if Git was initialized, false otherwise.
 */
export async function initializeGitRepository(targetDirectory) {
  const shouldInitGit = await confirm({
    message: "🐙 Initialize a Git repository?",
  });

  if (isCancel(shouldInitGit)) {
    cancel("❌ Operation cancelled.");
    process.exit(0);
  }

  if (!shouldInitGit) {
    return false;
  }

  const gitSpinner = spinner();
  gitSpinner.start("🐙 Initializing Git repository...");

  try {
    await execa("git", ["init"], { cwd: targetDirectory });
    await execa("git", ["add", "."], { cwd: targetDirectory });
    await execa("git", ["commit", "-m", "chore: initial commit"], {
      cwd: targetDirectory,
    });
    gitSpinner.stop("✅ Git repository initialized.");
    return true;
  } catch {
    gitSpinner.stop("⚠️ Could not initialize Git.");
    return false;
  }
}
