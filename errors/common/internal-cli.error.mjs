import { AppError } from "#errors/app-error.mjs";

/**
 * Error thrown for unexpected internal CLI failures.
 */
export class InternalCliError extends AppError {
  /**
   * @param {string} message - Error description.
   * @param {object} [options] - Additional error options.
   * @param {Record<string, unknown>} [options.details] - Context details.
   * @param {unknown} [options.cause] - Original caught error.
   */
  constructor(message, { details, cause } = {}) {
    super(message, {
      code: "INTERNAL_CLI_ERROR",
      exitCode: 1,
      details,
      cause,
      silent: false,
    });
  }
}
