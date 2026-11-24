import color from "picocolors";
import { ValidationError } from "#errors/common/validation.error.mjs";

/**
 * Formats a GrooveSkills-style rounded cyan banner followed by a copy-pasteable prompt body.
 * @param {string} heading - Banner heading text.
 * @param {string} promptBody - Prompt text printed below the banner without side borders.
 * @param {number} [minimumWidth=74] - Minimum inner width of the banner box.
 * @returns {string} Formatted terminal output string.
 */
export function formatAgentPromptBox(heading, promptBody, minimumWidth = 74) {
  if (typeof heading !== "string" || heading.trim().length === 0) {
    throw new ValidationError("Banner heading must be a non-empty string.");
  }

  if (typeof promptBody !== "string" || promptBody.trim().length === 0) {
    throw new ValidationError("Prompt body must be a non-empty string.");
  }

  const cleanHeading = heading.trim();
  const cleanPromptBody = promptBody.trim();
  const paddedHeading = `  ${cleanHeading}  `;
  const innerWidth = Math.max(minimumWidth, paddedHeading.length);
  const horizontalBorder = "─".repeat(innerWidth);
  const bannerContent = paddedHeading.padEnd(innerWidth, " ");

  const topLine = color.cyan(`╭${horizontalBorder}╮`);
  const middleLine = `${color.cyan("│")}${color.bgCyan(color.black(color.bold(bannerContent)))}${color.cyan("│")}`;
  const bottomLine = color.cyan(`╰${horizontalBorder}╯`);

  return `${topLine}\n${middleLine}\n${bottomLine}\n\n${color.bold(cleanPromptBody)}\n`;
}
