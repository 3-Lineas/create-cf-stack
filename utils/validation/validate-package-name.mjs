import path from "node:path";
import { ValidationError } from "#errors/common/validation.error.mjs";

const PACKAGE_NAME_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;
const MAX_PACKAGE_NAME_LENGTH = 214;

/**
 * Validates a user-supplied package or directory name against path traversal
 * and invalid npm/directory naming rules.
 * @param {string} rawName - The raw name provided by the user.
 * @param {string} [baseDirectory=process.cwd()] - The parent directory that must contain the target.
 * @returns {string} The validated, trimmed package name.
 * @throws {ValidationError} If the name is empty, invalid, or escapes baseDirectory.
 */
export function validatePackageName(rawName, baseDirectory = process.cwd()) {
  if (typeof rawName !== "string") {
    throw new ValidationError("Package name must be a non-empty string.");
  }

  const trimmedName = rawName.trim();

  if (
    trimmedName.length === 0 ||
    trimmedName.length > MAX_PACKAGE_NAME_LENGTH
  ) {
    throw new ValidationError(
      `Package name must be between 1 and ${MAX_PACKAGE_NAME_LENGTH} characters.`,
      { rawName },
    );
  }

  if (!PACKAGE_NAME_PATTERN.test(trimmedName)) {
    throw new ValidationError(
      `Invalid name "${trimmedName}". Use lowercase letters, numbers, hyphens, dots, or underscores, starting with a letter or number.`,
      { rawName: trimmedName },
    );
  }

  const resolvedBase = path.resolve(baseDirectory);
  const resolvedTarget = path.resolve(resolvedBase, trimmedName);

  if (
    path.dirname(resolvedTarget) !== resolvedBase ||
    resolvedTarget === resolvedBase
  ) {
    throw new ValidationError(
      `Invalid path "${trimmedName}". Directory traversal outside "${resolvedBase}" is not allowed.`,
      { rawName: trimmedName, baseDirectory: resolvedBase },
    );
  }

  return trimmedName;
}
