import { AppError } from "#errors/app-error.mjs";

/**
 * Error thrown when an expected monorepo or app directory does not exist.
 */
export class DirectoryNotFoundError extends AppError {
  /**
   * @param {string} message - Descriptive error message.
   * @param {Record<string, unknown>} [details] - Optional path context.
   */
  constructor(message, details) {
    super(message, {
      code: "DIRECTORY_NOT_FOUND",
      exitCode: 1,
      details,
      silent: true,
    });
  }
}
