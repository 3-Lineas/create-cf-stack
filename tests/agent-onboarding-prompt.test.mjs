import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildAgentOnboardingPrompt } from "#utils/agent/build-agent-onboarding-prompt.mjs";
import { formatAgentPromptBox } from "#utils/agent/format-agent-prompt-box.mjs";
import { ValidationError } from "#errors/common/validation.error.mjs";

const ANSI_ESCAPE_PATTERN = /\x1B\[[0-9;]*m/g;

/**
 * Strips ANSI color codes for deterministic terminal output assertions.
 * @param {string} rawText - Terminal string possibly containing ANSI codes.
 * @returns {string} Plain text without ANSI escape sequences.
 */
function stripAnsi(rawText) {
  return rawText.replace(ANSI_ESCAPE_PATTERN, "");
}

describe("buildAgentOnboardingPrompt", () => {
  it("includes the trimmed projectName in the generated prompt", () => {
    const prompt = buildAgentOnboardingPrompt("  my-awesome-app  ");
    assert.match(prompt, /"my-awesome-app"/);
  });

  it("instructs the agent to ask step-by-step questions to customize the template and GrooveSkills", () => {
    const prompt = buildAgentOnboardingPrompt("my-awesome-app");
    assert.match(prompt, /step-by-step questions/i);
    assert.match(prompt, /cf-stack\/template/i);
    assert.match(prompt, /author\/organization/i);
    assert.match(prompt, /repository URL/i);
    assert.match(prompt, /license/i);
    assert.match(prompt, /domain\/URLs/i);
    assert.match(prompt, /workspace scope/i);
    assert.match(prompt, /Cloudflare Worker\/D1\/Wrangler/i);
    assert.match(prompt, /branding\/README/i);
    assert.match(prompt, /GrooveSkills/i);
  });

  it("instructs the agent not to edit files until the user approves the plan", () => {
    const prompt = buildAgentOnboardingPrompt("my-awesome-app");
    assert.match(prompt, /Before editing any files/i);
    assert.match(prompt, /wait for my approval before applying any changes/i);
  });

  it("returns a clean single-paragraph prompt without internal newlines", () => {
    const prompt = buildAgentOnboardingPrompt("my-awesome-app");
    assert.equal(prompt.includes("\n"), false);
  });

  it("throws ValidationError on empty, whitespace-only, or non-string inputs", () => {
    assert.throws(() => buildAgentOnboardingPrompt(""), ValidationError);
    assert.throws(() => buildAgentOnboardingPrompt("   "), ValidationError);
    assert.throws(() => buildAgentOnboardingPrompt(null), ValidationError);
    assert.throws(() => buildAgentOnboardingPrompt(undefined), ValidationError);
    assert.throws(() => buildAgentOnboardingPrompt(123), ValidationError);
  });
});

describe("formatAgentPromptBox", () => {
  it("renders a rounded Unicode banner with the heading", () => {
    const output = stripAnsi(
      formatAgentPromptBox("COPY & PASTE SETUP PROMPT", "Hello world"),
    );
    const lines = output.trimEnd().split("\n");

    assert.match(lines[0], /^╭─+╮$/);
    assert.match(lines[1], /^│\s+COPY & PASTE SETUP PROMPT\s+│$/);
    assert.match(lines[2], /^╰─+╯$/);
  });

  it("places the prompt body below the bottom border without side borders", () => {
    const promptBody = "Hello! I just scaffolded this project.";
    const output = stripAnsi(formatAgentPromptBox("SETUP PROMPT", promptBody));
    const lines = output.trimEnd().split("\n");

    assert.equal(lines[3], "");
    assert.equal(lines[4], promptBody);
    assert.equal(lines[4].includes("│"), false);
  });

  it("expands the banner width dynamically when heading exceeds minimumWidth", () => {
    const longHeading = "A".repeat(90);
    const output = stripAnsi(formatAgentPromptBox(longHeading, "Body", 40));
    const lines = output.trimEnd().split("\n");

    assert.equal(lines[0].length, longHeading.length + 6);
    assert.equal(lines[2].length, longHeading.length + 6);
  });

  it("throws ValidationError when heading or promptBody is empty", () => {
    assert.throws(() => formatAgentPromptBox("", "Body"), ValidationError);
    assert.throws(() => formatAgentPromptBox("   ", "Body"), ValidationError);
    assert.throws(() => formatAgentPromptBox("Heading", ""), ValidationError);
    assert.throws(
      () => formatAgentPromptBox("Heading", "   "),
      ValidationError,
    );
  });
});
