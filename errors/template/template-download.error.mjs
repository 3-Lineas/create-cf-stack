import { AppError } from "#errors/app-error.mjs";

/**
 * Error thrown when downloading a project or app template fails.
 */
export class TemplateDownloadError extends AppError {
  /**
   * @param {string} message - Descriptive error message.
   * @param {object} [options] - Additional error options.
   * @param {Record<string, unknown>} [options.details] - Template context.
   * @param {unknown} [options.cause] - Underlying download error.
   */
  constructor(message, { details, cause } = {}) {
    super(message, {
      code: "TEMPLATE_DOWNLOAD_FAILED",
      exitCode: 1,
      details,
      cause,
      silent: false,
    });
  }
}
