import fs from "node:fs/promises";
import path from "node:path";
import { pathExists } from "#utils/fs/path-exists.mjs";
import { readJson } from "#utils/fs/read-json.mjs";

const DEFAULT_START_PORT = 3000;

/**
 * Scans the monorepo apps directory and returns the next available dev port.
 * Assumes port 3000 for Next.js apps that do not explicitly specify a port.
 * @param {string} [workingDirectory=process.cwd()] - Root directory of the monorepo.
 * @returns {Promise<number>} The next available port number.
 */
export async function getNextAvailablePort(workingDirectory = process.cwd()) {
  const appsDirectory = path.join(workingDirectory, "apps");

  if (!(await pathExists(appsDirectory))) {
    return DEFAULT_START_PORT;
  }

  const directoryEntries = await fs.readdir(appsDirectory, {
    withFileTypes: true,
  });
  const usedPorts = new Set();

  await Promise.all(
    directoryEntries.map(async (directoryEntry) => {
      if (!directoryEntry.isDirectory()) return;

      const packageJsonPath = path.join(
        appsDirectory,
        directoryEntry.name,
        "package.json",
      );
      if (!(await pathExists(packageJsonPath))) return;

      try {
        const packageJson = await readJson(packageJsonPath);

        if (!packageJson.scripts?.dev) return;

        const portMatch = packageJson.scripts.dev.match(
          /(?:-p|--port)\s+(\d+)/,
        );
        if (portMatch && portMatch[1]) {
          usedPorts.add(parseInt(portMatch[1], 10));
          return;
        }

        const hasNextDependency =
          packageJson.dependencies?.next || packageJson.devDependencies?.next;
        if (hasNextDependency) {
          usedPorts.add(DEFAULT_START_PORT);
        }
      } catch {
        // Ignore malformed package.json files when scanning ports
      }
    }),
  );

  let candidatePort = DEFAULT_START_PORT;
  while (usedPorts.has(candidatePort)) {
    candidatePort++;
  }

  return candidatePort;
}
