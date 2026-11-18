import { AppError } from "#errors/app-error.mjs";

/**
 * Error thrown when a target application directory already exists.
 */
export class AppAlreadyExistsError extends AppError {
  /**
   * @param {string} message - Descriptive error message.
   * @param {Record<string, unknown>} [details] - Optional app context.
   */
  constructor(message, details) {
    super(message, {
      code: "APP_ALREADY_EXISTS",
      exitCode: 1,
      details,
      silent: true,
    });
  }
}
