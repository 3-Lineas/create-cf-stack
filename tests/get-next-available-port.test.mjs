import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { getNextAvailablePort } from "#utils/monorepo/get-next-available-port.mjs";
import { writeJson } from "#utils/fs/write-json.mjs";

describe("getNextAvailablePort", () => {
  const tempDirectories = [];

  afterEach(async () => {
    await Promise.all(
      tempDirectories.map((directory) =>
        fs.rm(directory, { recursive: true, force: true }),
      ),
    );
    tempDirectories.length = 0;
  });

  it("returns 3000 when apps directory does not exist", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "cf-stack-port-"));
    tempDirectories.push(tempDir);

    const nextPort = await getNextAvailablePort(tempDir);
    assert.equal(nextPort, 3000);
  });

  it("skips default Next.js 3000 and explicit -p / --port assignments", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "cf-stack-port-"));
    tempDirectories.push(tempDir);

    const webDir = path.join(tempDir, "apps", "web");
    const docsDir = path.join(tempDir, "apps", "docs");
    const adminDir = path.join(tempDir, "apps", "admin");

    await fs.mkdir(webDir, { recursive: true });
    await fs.mkdir(docsDir, { recursive: true });
    await fs.mkdir(adminDir, { recursive: true });

    await writeJson(path.join(webDir, "package.json"), {
      name: "web",
      scripts: { dev: "next dev" },
      dependencies: { next: "15.0.0" },
    });
    await writeJson(path.join(docsDir, "package.json"), {
      name: "docs",
      scripts: { dev: "next dev -p 3001" },
    });
    await writeJson(path.join(adminDir, "package.json"), {
      name: "admin",
      scripts: { dev: "next dev --port 3002" },
    });

    const nextPort = await getNextAvailablePort(tempDir);
    assert.equal(nextPort, 3003);
  });
});
