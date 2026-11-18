/**
 * Base application error for the create-cf-stack CLI.
 * Provides structured metadata for consistent top-level error handling.
 */
export class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message.
   * @param {object} [options] - Additional error metadata.
   * @param {string} [options.code="APP_ERROR"] - Machine-readable error code.
   * @param {number} [options.exitCode=1] - Process exit code.
   * @param {Record<string, unknown>} [options.details] - Structured context details.
   * @param {unknown} [options.cause] - Original underlying error.
   * @param {boolean} [options.silent=false] - Whether to suppress stack/cause output.
   */
  constructor(
    message,
    { code = "APP_ERROR", exitCode = 1, details, cause, silent = false } = {},
  ) {
    super(message, cause !== undefined ? { cause } : undefined);
    this.name = this.constructor.name;
    this.code = code;
    this.exitCode = exitCode;
    this.details = details;
    this.silent = silent;
    this.timestamp = new Date().toISOString();
  }
}
