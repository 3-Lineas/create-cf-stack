import { AppError } from "#errors/app-error.mjs";

/**
 * Error thrown when CLI arguments or user-supplied names fail validation.
 */
export class ValidationError extends AppError {
  /**
   * @param {string} message - Validation failure message.
   * @param {Record<string, unknown>} [details] - Optional validation context.
   */
  constructor(message, details) {
    super(message, {
      code: "VALIDATION_ERROR",
      exitCode: 1,
      details,
      silent: true,
    });
  }
}
