---
status: completed
createdAt: 2026-11-17
---

# 26-11-17 — CLI Architecture & Quality Modernization Spec

## Outcome Hypothesis
By decomposing multi-export and mixed-concern CLI modules into atomic `*.mjs` files, introducing a centralized `AppError` boundary with strict input validation, aligning `package.json` metadata to English (`en`), and adding `node --test` + `prettier --check` gates, `@3lineas/create-cf-stack` will achieve full compliance with GrooveSkills Harness standards, proven by passing `pnpm test`, `pnpm format:check`, and CLI smoke checks.

## Scope
- **In scope (Spec / Proposal)**:
  - Atomic file split (`utils/fs/*.mjs`, `utils/monorepo/get-next-available-port.mjs`, `utils/package-manager/install-dependencies.mjs`, `utils/git/initialize-git-repository.mjs`).
  - Centralized `AppError` hierarchy (`errors/*.mjs`) + top-level normalizer in `index.mjs`.
  - Input validation guard (`utils/validation/validate-package-name.mjs`) preventing path traversal and invalid package/directory names.
  - Descriptive naming refactor (removing `s`, `e`, `pkg`), `package.json` English description, `"files"` update, `#` subpath imports, and `test` / `format:check` scripts.
  - Unit tests under `tests/` using `node:test`.
- **Out of scope**:
  - Major dependency bumps (`@clack/prompts`, `execa`, `giget`, `picocolors`, `prettier`) unless explicitly approved.
  - Migrating the CLI to TypeScript.
  - Altering the remote template repository.

## Open Questions for User Approval
1. Confirm Node.js native subpath `#` imports (`#commands/*.mjs`, `#utils/*.mjs`, `#errors/*.mjs`) in `package.json` vs relative imports.
2. Confirm keeping current dependency versions during this architectural refactor (separate PR/task for any major bumps).
3. Confirm fixing the missing `spinner.start(...)` call before `git init` in `commands/create.mjs` via the extracted `initializeGitRepository` utility.

## Checklist
- [x] Draft Lane 3 architectural proposal & implementation plan (`implementation_plan.md`) for user review.
- [x] Obtain user confirmation on plan and open questions before switching to Lane 2 (Task).
- [x] Decompose `utils/fs.mjs`, `commands/add.mjs`, and `commands/create.mjs` into 1-function-per-file modules.
- [x] Implement `errors/` hierarchy and centralized `normalizeError` boundary in `index.mjs`.
- [x] Add `validatePackageName` trust-boundary guard and `node:test` unit tests.
- [x] Update `package.json` (English description, `errors` in `files`, `#` subpath imports, `test` and `format:check` scripts).

## Evidence
- `pnpm install` succeeded (`+43` packages).
- `pnpm test` (`node --test "tests/**/*.test.mjs"`): 15/15 tests passed across 5 suites (`fs utilities`, `getNextAvailablePort`, `normalizeError`, `renameApp`, `validatePackageName`).
- `npx prettier --write "commands/**/*.mjs" "errors/**/*.mjs" "utils/**/*.mjs" "tests/**/*.mjs" "index.mjs" "package.json"` formatted all code/test files; `pnpm format:check` exited 1 only on pre-existing `.grooveskills/**` and `AGENTS.md` files.
- `node index.mjs --help` exited `0` and printed CLI help.
- `node index.mjs add ../escape` exited `1` with `❌ Invalid name "../escape"...` (`ValidationError`).
