# Project Context & Architecture: @3lineas/create-cf-stack

This file provides AI agents with instant architectural orientation for this project.

## 1. Stack & Dependencies
- **Runtime & Module System**: Node.js ESM (`"type": "module"`, `*.mjs` with JSDoc, no `tsconfig.json` / build step)
- **Entry Point & Binary**: `index.mjs` (`bin.create-cf-stack`)
- **Package Manager**: `pnpm` (agreed standard for this CLI repo and generated monorepo projects)
- **Runtime Dependencies**:
  - `@clack/prompts` (`^0.7.0`)
  - `execa` (`^8.0.1`)
  - `giget` (`^1.2.1`)
  - `picocolors` (`^1.0.0`)
- **Dev Dependencies**:
  - `prettier` (`^3.7.4`, configured via `.prettierrc`)

## 2. Directory Structure & Architectural Conventions
- **Language & Imports**: Pure ESM JavaScript (`*.mjs`) with JSDoc annotations and Node subpath imports (`#commands/*.mjs`, `#utils/*.mjs`, `#errors/*.mjs` in `package.json`); zero barrel files (`index.mjs` is strictly the CLI entry point, never a re-export barrel); hard limit of `<200` lines per file.
- **CLI-Adapted Atomic File Rule**: Enforce **1 exported function per file** across CLI-adapted folders (`commands/`, `utils/{domain}/`, `errors/`). Do not force backend `src/actions/{domain}/` or `src/routes/{domain}/` layouts onto this CLI package unless scope expands.
- **Error Handling & Trust Boundary**: Centralized `AppError` hierarchy (`errors/app-error.mjs`, `errors/common/`, `errors/monorepo/`, `errors/template/`) + top-level `normalizeError` in `index.mjs`, with strict CLI input validation (`utils/validation/validate-package-name.mjs` guarding `projectName`, `appName`, `oldName`, and `newName` against path traversal and invalid package/directory names).
- **Descriptive Naming**: Zero single-letter or cryptic abbreviations (`s`, `e`, `pkg`) in code; always use descriptive domain identifiers.

### Current Source Layout & Data Flow
- `index.mjs`: Parses `process.argv.slice(2)` and dispatches `add <name>`, `rename <old> <new>`, `help` (`--help`, `-h`), or default `createProject()`, wrapped in top-level `normalizeError` handling.
- `commands/`:
  - `create.mjs`: Prompts for `projectName`, validates it, downloads `gh:3-Lineas/Template-Turborepo-Hono-Next-Cloudflare-Dizzler-Shadcn` via `giget`, updates root `package.json`, and optionally runs `installDependencies()` + `initializeGitRepository()`.
  - `add.mjs`: Checks `apps/`, optionally delegates to `renameApp("web", name)`, downloads `/apps/web` via `giget`, computes `getNextAvailablePort()` starting at `3000`, updates `package.json`, and optionally runs `installDependencies()`.
  - `rename.mjs`: Validates names, renames `apps/<oldName>` to `apps/<newName>`, and updates `package.json` `name`.
  - `help.mjs`: Prints CLI usage and command examples.
- `errors/`:
  - `app-error.mjs`: Base `AppError` class with `code`, `exitCode`, `details`, `cause`, and `silent`.
  - `common/`: `internal-cli.error.mjs`, `normalize-error.mjs`, `validation.error.mjs`.
  - `monorepo/`: `app-already-exists.error.mjs`, `directory-not-found.error.mjs`.
  - `template/`: `template-download.error.mjs`.
- `utils/`:
  - `agent/`: `build-agent-onboarding-prompt.mjs`, `format-agent-prompt-box.mjs`.
  - `fs/`: `path-exists.mjs`, `read-json.mjs`, `write-json.mjs`.
  - `git/`: `initialize-git-repository.mjs`.
  - `monorepo/`: `get-next-available-port.mjs`.
  - `package-manager/`: `install-dependencies.mjs`.
  - `validation/`: `validate-package-name.mjs`.
- `tests/`:
  - `agent-onboarding-prompt.test.mjs`, `fs-utils.test.mjs`, `get-next-available-port.test.mjs`, `normalize-error.test.mjs`, `rename-app.test.mjs`, `validate-package-name.test.mjs` (`node:test`).

## 3. Installed Skill Scope
- **Active Core Skills**: `best-practices`, `clean-architecture-ddd` (CLI-adapted folders), `error-handling-logging` (CLI `errors/app-error.mjs` exception), `ux-writing`, `docs-standards`, `security-audit`, `world-class-engineering`, `groove-harness`, `odd-ai`.
- **N/A Unless Scope Expands (Web/HTTP/DB/TS/Vitest Domains)**: `auth-rbac-policies`, `caching-rate-limiting`, `controller-orchestration-queues`, `env-feature-flags`, `external-service-adapters`, `storage-file-adapters`, `webhook-idempotency`, `typescript-clean`, `valibot-validation`, `testing-vitest`.

## 4. Communication & User Copy Language
- **Configured Language**: English (`en`).
- **Policy**: All user-facing CLI prompts, errors, help text, docs, and `package.json` metadata must be written strictly in English with an empathetic, friendly, persuasive, and professional tone.

## 5. Essential Commands & Verification Status
- **Scripts (`package.json`)**:
  - `start`: `node index.mjs`
  - `test`: `node --test "tests/**/*.test.mjs"` (24/24 passing across 6 suites)
  - `format`: `prettier --write "**/*.{js,mjs,json,md}"`
  - `format:check`: `prettier --check "**/*.{js,mjs,json,md}"` (passing)
