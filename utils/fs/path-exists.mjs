import fs from "node:fs/promises";

/**
 * Checks whether a directory or file exists on disk.
 * @param {string} targetPath - The filesystem path to check.
 * @returns {Promise<boolean>} True if accessible, false otherwise.
 */
export async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}
