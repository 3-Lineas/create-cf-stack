# Task: Post-Install AI Agent Onboarding Prompt

- **Status**: completed
- **Lane**: Lane 2 (Task)

## Outcome Hypothesis

Printing a GrooveSkills-style copy-pasteable prompt at the end of `createProject()` (`commands/create.mjs`) gives users a one-click way to instruct their AI agent to inspect the newly scaffolded repository, ask step-by-step customization questions (removing generic `cf-stack`/template references and aligning GrooveSkills), and propose a prioritized plan before editing any files.

## Scope

- `utils/agent/build-agent-onboarding-prompt.mjs`
- `utils/agent/format-agent-prompt-box.mjs`
- `commands/create.mjs`
- `tests/agent-onboarding-prompt.test.mjs`
- `README.md`
- `.grooveskills/memory/context.md`
- `.grooveskills/bitacora/2026-11.md`

## Checklist

- [x] Implement atomic `buildAgentOnboardingPrompt(projectName)` with `ValidationError` guard.
- [x] Implement atomic `formatAgentPromptBox(heading, promptBody, minimumWidth)` with rounded cyan banner and borderless bold prompt body.
- [x] Integrate step 3 and formatted prompt output into `commands/create.mjs`.
- [x] Add unit tests in `tests/agent-onboarding-prompt.test.mjs`.
- [x] Update `README.md`, `.grooveskills/memory/context.md`, and `.grooveskills/bitacora/2026-11.md`.
- [x] Verify with `pnpm test` and `pnpm format:check`.

## Evidence

- `pnpm test`: 24/24 passing across 6 suites (`tests/agent-onboarding-prompt.test.mjs` + 5 existing suites).
- `pnpm format:check`: All matched files use Prettier code style.
- File line counts (`wc -l`) all well below 200 lines, 1 exported function per file.
