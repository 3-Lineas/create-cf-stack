import path from "node:path";
import fs from "node:fs/promises";
import { spinner } from "@clack/prompts";
import { pathExists } from "#utils/fs/path-exists.mjs";
import { readJson } from "#utils/fs/read-json.mjs";
import { writeJson } from "#utils/fs/write-json.mjs";
import { validatePackageName } from "#utils/validation/validate-package-name.mjs";
import { DirectoryNotFoundError } from "#errors/monorepo/directory-not-found.error.mjs";
import { AppAlreadyExistsError } from "#errors/monorepo/app-already-exists.error.mjs";
import { InternalCliError } from "#errors/common/internal-cli.error.mjs";

/**
 * Renames an application directory and updates its package.json name.
 * @param {string} oldName - The current name/directory of the application.
 * @param {string} newName - The new name/directory for the application.
 * @returns {Promise<boolean>} True if successful.
 */
export async function renameApp(oldName, newName) {
  const appsDirectory = path.join(process.cwd(), "apps");
  const validatedOldName = validatePackageName(oldName, appsDirectory);
  const validatedNewName = validatePackageName(newName, appsDirectory);

  const oldPath = path.join(appsDirectory, validatedOldName);
  const newPath = path.join(appsDirectory, validatedNewName);

  if (!(await pathExists(oldPath))) {
    throw new DirectoryNotFoundError(
      `App "${validatedOldName}" was not found in "apps/".`,
      { oldPath },
    );
  }

  if (await pathExists(newPath)) {
    throw new AppAlreadyExistsError(
      `An app named "${validatedNewName}" already exists in "apps/".`,
      { newPath },
    );
  }

  const renameSpinner = spinner();
  renameSpinner.start(
    `Renaming "${validatedOldName}" to "${validatedNewName}"...`,
  );

  try {
    await fs.rename(oldPath, newPath);

    const packageJsonPath = path.join(newPath, "package.json");
    const packageJson = await readJson(packageJsonPath);
    packageJson.name = validatedNewName;
    await writeJson(packageJsonPath, packageJson);

    renameSpinner.stop("✅ App renamed successfully.");
    return true;
  } catch (caughtError) {
    renameSpinner.stop("💥 Error renaming the app.");
    throw new InternalCliError(
      `Failed to rename "${validatedOldName}" to "${validatedNewName}".`,
      { cause: caughtError },
    );
  }
}
