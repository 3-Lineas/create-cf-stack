import path from "node:path";
import fs from "node:fs/promises";
import { spinner } from "@clack/prompts";

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

  s.start(`Renombrando "${oldName}" a "${newName}"...`);

  try {
    await fs.access(oldPath);
  } catch (e) {
    s.stop(`❌ No se encontró la app "${oldName}" en "apps/".`);
    process.exit(1);
  }

  try {
    await fs.access(newPath);
    s.stop(`❌ Ya existe una app llamada "${newName}".`);
    process.exit(1);
  } catch (e) {
    // Continue if new directory doesn't exist
  }

  try {
    await fs.rename(oldPath, newPath);

    const pkgPath = path.join(newPath, "package.json");
    const pkgContent = await fs.readFile(pkgPath, "utf-8");
    const pkg = JSON.parse(pkgContent);
    pkg.name = newName;
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));

    s.stop(`✅ App renombrada exitosamente.`);

    return true;
  } catch (error) {
    s.stop("💥 Error al renombrar la app.");
    console.error(error);
    process.exit(1);
  }
}
