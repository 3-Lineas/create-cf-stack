import { AppError } from "#errors/app-error.mjs";
import { InternalCliError } from "#errors/common/internal-cli.error.mjs";

/**
 * Normalizes any thrown value into an AppError instance.
 * @param {unknown} caughtError - The error caught at the CLI boundary.
 * @returns {AppError} A normalized AppError instance.
 */
export function normalizeError(caughtError) {
  if (caughtError instanceof AppError) {
    return caughtError;
  }

  if (caughtError instanceof Error) {
    return new InternalCliError(caughtError.message, {
      cause: caughtError,
    });
  }

  return new InternalCliError("An unexpected error occurred.", {
    details: { rawError: String(caughtError) },
  });
}
