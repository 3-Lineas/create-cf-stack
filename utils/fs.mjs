import fs from "node:fs/promises";

/**
 * Checks if a directory or file exists.
 * @param {string} path - The path to check.
 * @returns {Promise<boolean>} True if exists, false otherwise.
 */
export async function pathExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Reads and parses a JSON file.
 * @param {string} path - The path to the JSON file.
 * @returns {Promise<any>} The parsed JSON object.
 * @throws {Error} If file cannot be read or parsed.
 */
export async function readJson(path) {
  const content = await fs.readFile(path, "utf-8");
  return JSON.parse(content);
}

/**
 * Writes an object to a JSON file.
 * @param {string} path - The path to the JSON file.
 * @param {any} data - The data to write.
 * @returns {Promise<void>}
 */
export async function writeJson(path, data) {
  await fs.writeFile(path, JSON.stringify(data, null, 2));
}
