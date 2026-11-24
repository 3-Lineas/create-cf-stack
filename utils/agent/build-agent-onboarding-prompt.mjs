import { ValidationError } from "#errors/common/validation.error.mjs";

/**
 * Builds the copy-pasteable post-install onboarding prompt for the user's AI agent.
 * @param {string} projectName - Name of the newly scaffolded project.
 * @returns {string} Single-paragraph prompt ready to copy and paste.
 */
export function buildAgentOnboardingPrompt(projectName) {
  if (typeof projectName !== "string" || projectName.trim().length === 0) {
    throw new ValidationError(
      "Project name must be a non-empty string to build the agent prompt.",
    );
  }

  const cleanProjectName = projectName.trim();

  return [
    `Hello! I just scaffolded this project ("${cleanProjectName}") with create-cf-stack.`,
    "Please inspect the repository (including `package.json` files, `README.md`, `apps/`, `packages/`, Wrangler/Cloudflare configs, frontend metadata, and `.grooveskills/` / `AGENTS.md` / `.agents/skills/` if present).",
    "Before editing any files, ask me step-by-step questions to turn this template into a real, production-ready project (removing any generic cf-stack/template references) and align GrooveSkills — covering project/product name, description, author/organization, repository URL, license, domain/URLs, workspace scope and app/package names, Cloudflare Worker/D1/Wrangler names, environment setup, branding/README metadata, preferred language, and GrooveSkills context/decisions/skills.",
    "Once I answer, present a clear, prioritized customization plan and wait for my approval before applying any changes.",
  ].join(" ");
}
