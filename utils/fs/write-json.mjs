import fs from "node:fs/promises";
import { InternalCliError } from "#errors/common/internal-cli.error.mjs";

/**
 * Serializes and writes a JSON payload to disk with a trailing newline.
 * @param {string} filePath - The destination JSON file path.
 * @param {unknown} jsonPayload - The data to serialize.
 * @returns {Promise<void>}
 * @throws {InternalCliError} If writing to disk fails.
 */
export async function writeJson(filePath, jsonPayload) {
  try {
    const formattedJson = `${JSON.stringify(jsonPayload, null, 2)}\n`;
    await fs.writeFile(filePath, formattedJson, "utf-8");
  } catch (caughtError) {
    throw new InternalCliError(`Failed to write JSON file at "${filePath}".`, {
      details: { filePath },
      cause: caughtError,
    });
  }
}
