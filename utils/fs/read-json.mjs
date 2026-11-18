import fs from "node:fs/promises";
import { InternalCliError } from "#errors/common/internal-cli.error.mjs";

/**
 * Reads and parses a JSON file from disk.
 * @param {string} filePath - The path to the JSON file.
 * @returns {Promise<any>} The parsed JSON payload.
 * @throws {InternalCliError} If the file cannot be read or parsed.
 */
export async function readJson(filePath) {
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (caughtError) {
    throw new InternalCliError(`Failed to read JSON file at "${filePath}".`, {
      details: { filePath },
      cause: caughtError,
    });
  }
}
