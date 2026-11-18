# Project Context & Architecture: @3lineas/create-cf-stack

This file provides AI agents with instant architectural orientation for this project.

## 1. Stack & Dependencies
- **Runtime & Module System**: Node.js ESM (`"type": "module"`, `*.mjs` with JSDoc, no `tsconfig.json` / build step)
- **Entry Point & Binary**: `index.mjs` (`bin.create-cf-stack`)
- **Package Manager**: `pnpm` (agreed standard for this CLI repo and generated monorepo projects; `node_modules/` is not currently installed locally)
- **Runtime Dependencies**:
  - `@clack/prompts` (`^0.7.0`)
  - `execa` (`^8.0.1`)
  - `giget` (`^1.2.1`)
  - `picocolors` (`^1.0.0`)
- **Dev Dependencies**:
  - `prettier` (`^3.7.4`, configured via `.prettierrc`)

## 2. Directory Structure & Architectural Conventions
- **Language & Imports**: Pure ESM JavaScript (`*.mjs`) with JSDoc annotations. Prefer Node subpath imports (`#...` in `package.json`) or clean documented relative imports; zero barrel files (`index.mjs` is strictly the CLI entry point, never a re-export barrel); hard limit of `<200` lines per file.
- **CLI-Adapted Atomic File Rule**: Enforce **1 exported function per file** across CLI-adapted folders (`commands/`, `utils/{domain}/`, `errors/`). Do not force backend `src/actions/{domain}/` or `src/routes/{domain}/` layouts onto this CLI package unless scope expands.
- **Error Handling & Trust Boundary**: Target a centralized `AppError` hierarchy (`errors/`) + top-level error normalizer in `index.mjs`, with strict CLI input validation (guarding `projectName`, `appName`, `oldName`, and `newName` against path traversal and invalid package/directory names).
- **Descriptive Naming**: Zero single-letter or cryptic abbreviations (`s`, `e`, `pkg`) in new or refactored code; always use descriptive domain identifiers.

### Current Source Layout & Data Flow
- `index.mjs`: Parses `process.argv.slice(2)` and dispatches `add <name>`, `rename <old> <new>`, `help` (`--help`, `-h`), or default `createProject()`.
- `commands/`:
  - `create.mjs`: Prompts for `projectName`, downloads `gh:3-Lineas/Template-Turborepo-Hono-Next-Cloudflare-Dizzler-Shadcn` via `giget`, updates root `package.json`, and optionally runs `pnpm install` + `git init`/initial commit.
  - `add.mjs`: Checks `apps/`, optionally delegates to `renameApp("web", name)`, downloads the `/apps/web` subpath via `giget`, computes `getNextAvailablePort()` starting at `3000`, updates `package.json`, and optionally runs `pnpm install`.
  - `rename.mjs`: Renames `apps/<oldName>` to `apps/<newName>` and updates `package.json` `name`.
  - `help.mjs`: Prints CLI usage and command examples.
- `utils/`:
  - `fs.mjs`: Exports `pathExists`, `readJson`, and `writeJson`.

### Documented Architectural Debt (Future Refactors Only)
- `utils/fs.mjs` currently exports 3 functions in one file (violates 1-function-per-file rule).
- `commands/add.mjs` mixes `getNextAvailablePort()`, `@clack/prompts` UI, `giget` download, filesystem updates, and `execa` execution in one file.
- Error handling uses inline `console.error` + `process.exit(1)` (and `create.mjs` logs without exiting on `package.json` failure), with no input sanitization on user-supplied names.
- Short identifiers (`s`, `e`, `pkg`) remain in existing files (`create.mjs`, `add.mjs`, `rename.mjs`).
- `package.json` `"description"` is currently in Spanish (`"CLI para crear un nuevo stack Cloudflare + Next.js + Hono"`).

## 3. Installed Skill Scope
- **Active Core Skills**: `best-practices`, `clean-architecture-ddd` (CLI-adapted folders), `error-handling-logging`, `ux-writing`, `docs-standards`, `security-audit`, `world-class-engineering`, `groove-harness`, `odd-ai`.
- **N/A Unless Scope Expands (Web/HTTP/DB Domains)**: `auth-rbac-policies`, `caching-rate-limiting`, `controller-orchestration-queues`, `env-feature-flags`, `external-service-adapters`, `storage-file-adapters`, `webhook-idempotency`.

## 4. Communication & User Copy Language
- **Configured Language**: English (`en`).
- **Policy**: All user-facing CLI prompts, errors, help text, docs, and `package.json` metadata must be written strictly in English with an empathetic, friendly, persuasive, and professional tone.

## 5. Essential Commands & Verification Status
- **Existing Scripts (`package.json`)**:
  - `start`: `node index.mjs`
  - `format`: `prettier --write "**/*.{js,mjs,json,md}"`
- **Target Verification Gates (Not Yet Configured)**:
  - `test`: `node --test` (built-in Node.js test runner)
  - `format:check`: `prettier --check "**/*.{js,mjs,json,md}"`
- **Observed Gaps**: `node_modules/` is missing locally, and no `test`, `lint`, or `typecheck` scripts exist in `package.json`.
