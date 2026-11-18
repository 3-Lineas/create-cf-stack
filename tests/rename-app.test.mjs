import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { renameApp } from "#commands/rename.mjs";
import { writeJson } from "#utils/fs/write-json.mjs";
import { readJson } from "#utils/fs/read-json.mjs";
import { pathExists } from "#utils/fs/path-exists.mjs";
import { DirectoryNotFoundError } from "#errors/monorepo/directory-not-found.error.mjs";
import { AppAlreadyExistsError } from "#errors/monorepo/app-already-exists.error.mjs";
import { ValidationError } from "#errors/common/validation.error.mjs";

describe("renameApp", () => {
  const originalCwd = process.cwd();
  const tempDirectories = [];

  afterEach(async () => {
    process.chdir(originalCwd);
    await Promise.all(
      tempDirectories.map((directory) =>
        fs.rm(directory, { recursive: true, force: true }),
      ),
    );
    tempDirectories.length = 0;
  });

  it("renames an existing app directory and updates package.json name", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "cf-stack-ren-"));
    tempDirectories.push(tempDir);

    const webDir = path.join(tempDir, "apps", "web");
    await fs.mkdir(webDir, { recursive: true });
    await writeJson(path.join(webDir, "package.json"), { name: "web" });

    process.chdir(tempDir);
    const result = await renameApp("web", "landing");

    assert.equal(result, true);
    assert.equal(await pathExists(webDir), false);
    const landingJson = await readJson(
      path.join(tempDir, "apps", "landing", "package.json"),
    );
    assert.equal(landingJson.name, "landing");
  });

  it("throws DirectoryNotFoundError when source app does not exist", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "cf-stack-ren-"));
    tempDirectories.push(tempDir);
    await fs.mkdir(path.join(tempDir, "apps"), { recursive: true });

    process.chdir(tempDir);
    await assert.rejects(
      () => renameApp("missing", "landing"),
      DirectoryNotFoundError,
    );
  });

  it("throws AppAlreadyExistsError when target app already exists", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "cf-stack-ren-"));
    tempDirectories.push(tempDir);
    await fs.mkdir(path.join(tempDir, "apps", "web"), { recursive: true });
    await fs.mkdir(path.join(tempDir, "apps", "landing"), { recursive: true });

    process.chdir(tempDir);
    await assert.rejects(
      () => renameApp("web", "landing"),
      AppAlreadyExistsError,
    );
  });

  it("throws ValidationError on path traversal attempts", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "cf-stack-ren-"));
    tempDirectories.push(tempDir);

    process.chdir(tempDir);
    await assert.rejects(
      () => renameApp("../secret", "landing"),
      ValidationError,
    );
  });
});
