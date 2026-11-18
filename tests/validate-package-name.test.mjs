import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validatePackageName } from "#utils/validation/validate-package-name.mjs";
import { ValidationError } from "#errors/common/validation.error.mjs";

describe("validatePackageName", () => {
  it("accepts valid lowercase package names", () => {
    assert.equal(validatePackageName("my-app", "/tmp/workspace"), "my-app");
    assert.equal(validatePackageName("web_2.0", "/tmp/workspace"), "web_2.0");
    assert.equal(
      validatePackageName("  trimmed-app  ", "/tmp/workspace"),
      "trimmed-app",
    );
  });

  it("rejects path traversal and directory separators", () => {
    assert.throws(
      () => validatePackageName("../secret", "/tmp/workspace"),
      ValidationError,
    );
    assert.throws(
      () => validatePackageName("foo/bar", "/tmp/workspace"),
      ValidationError,
    );
    assert.throws(
      () => validatePackageName("..", "/tmp/workspace"),
      ValidationError,
    );
  });

  it("rejects empty strings, uppercase letters, and spaces", () => {
    assert.throws(
      () => validatePackageName("", "/tmp/workspace"),
      ValidationError,
    );
    assert.throws(
      () => validatePackageName("   ", "/tmp/workspace"),
      ValidationError,
    );
    assert.throws(
      () => validatePackageName("MyApp", "/tmp/workspace"),
      ValidationError,
    );
    assert.throws(
      () => validatePackageName("my app", "/tmp/workspace"),
      ValidationError,
    );
    assert.throws(
      () => validatePackageName(".hidden", "/tmp/workspace"),
      ValidationError,
    );
  });
});
