import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeError } from "#errors/common/normalize-error.mjs";
import { ValidationError } from "#errors/common/validation.error.mjs";
import { InternalCliError } from "#errors/common/internal-cli.error.mjs";

describe("normalizeError", () => {
  it("returns AppError subclasses untouched", () => {
    const originalError = new ValidationError("Invalid app name");
    const normalized = normalizeError(originalError);

    assert.equal(normalized, originalError);
    assert.equal(normalized.code, "VALIDATION_ERROR");
    assert.equal(normalized.silent, true);
  });

  it("wraps unknown Error instances in InternalCliError", () => {
    const originalError = new Error("Unexpected failure");
    const normalized = normalizeError(originalError);

    assert.ok(normalized instanceof InternalCliError);
    assert.equal(normalized.message, "Unexpected failure");
    assert.equal(normalized.cause, originalError);
  });

  it("wraps non-Error values in InternalCliError", () => {
    const normalized = normalizeError("string-failure");

    assert.ok(normalized instanceof InternalCliError);
    assert.equal(normalized.details?.rawError, "string-failure");
  });
});
