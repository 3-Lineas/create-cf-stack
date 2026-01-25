import path from "node:path";
import fs from "node:fs/promises";
import { spinner } from "@clack/prompts";
import { pathExists, readJson, writeJson } from "../utils/fs.mjs";

/**
 * Renames an application directory and updates its package.json name.
 * @param {string} oldName - The current name/directory of the application.
 * @param {string} newName - The new name/directory for the application.
 * @returns {Promise<boolean>} True if successful.
 */
export async function renameApp(oldName, newName) {
  const s = spinner();
  const appsDir = path.join(process.cwd(), "apps");
  const oldPath = path.join(appsDir, oldName);
  const newPath = path.join(appsDir, newName);

  s.start(`Renaming "${oldName}" to "${newName}"...`);

  if (!(await pathExists(oldPath))) {
    s.stop(`❌ App "${oldName}" not found in "apps/".`);
    process.exit(1);
  }

  if (await pathExists(newPath)) {
    s.stop(`❌ An app named "${newName}" already exists.`);
    process.exit(1);
  }

  try {
    await fs.rename(oldPath, newPath);

    const pkgPath = path.join(newPath, "package.json");
    const pkg = await readJson(pkgPath);
    pkg.name = newName;
    await writeJson(pkgPath, pkg);

    s.stop(`✅ App renamed successfully.`);

    return true;
  } catch (error) {
    s.stop("💥 Error renaming the app.");
    console.error(error);
    process.exit(1);
  }
}
