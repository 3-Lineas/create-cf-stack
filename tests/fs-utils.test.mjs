import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathExists } from "#utils/fs/path-exists.mjs";
import { readJson } from "#utils/fs/read-json.mjs";
import { writeJson } from "#utils/fs/write-json.mjs";
import { InternalCliError } from "#errors/common/internal-cli.error.mjs";

describe("fs utilities", () => {
  const tempDirectories = [];

  afterEach(async () => {
    await Promise.all(
      tempDirectories.map((directory) =>
        fs.rm(directory, { recursive: true, force: true }),
      ),
    );
    tempDirectories.length = 0;
  });

  it("checks path existence accurately", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "cf-stack-fs-"));
    tempDirectories.push(tempDir);

    assert.equal(await pathExists(tempDir), true);
    assert.equal(await pathExists(path.join(tempDir, "missing.json")), false);
  });

  it("writes and reads formatted JSON with trailing newline", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "cf-stack-fs-"));
    tempDirectories.push(tempDir);

    const filePath = path.join(tempDir, "package.json");
    const payload = { name: "test-app", version: "1.0.0" };

    await writeJson(filePath, payload);
    const rawContent = await fs.readFile(filePath, "utf-8");
    assert.ok(rawContent.endsWith("\n"));

    const parsed = await readJson(filePath);
    assert.deepEqual(parsed, payload);
  });

  it("throws InternalCliError when reading a missing or invalid JSON file", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "cf-stack-fs-"));
    tempDirectories.push(tempDir);

    await assert.rejects(
      () => readJson(path.join(tempDir, "nonexistent.json")),
      InternalCliError,
    );
  });
});
