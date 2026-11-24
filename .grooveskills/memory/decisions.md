# Architecture Decision Records (ADR)

An append-only log of significant technical and architectural choices.

| Date | Title | Decision | Reason & Consequences |
| :--- | :--- | :--- | :--- |
| 2026-11-18 | Adopt GrooveSkills Harness | Initialized `.grooveskills/` control plane with ODD | Clean, encapsulated agent memory, 3-lane ODD flow, and English copy standard |
| 2026-11-17 | Pure ESM JavaScript Runtime | Keep `*.mjs` ESM with JSDoc and Node subpath imports (`#...`) or clean relative imports instead of migrating to TypeScript | Avoids build/transpilation overhead for a lightweight CLI while documenting `@/` alias exception |
| 2026-11-17 | CLI-Adapted Atomic File Structure | Enforce 1 exported function per file across `commands/`, `utils/{domain}/`, and `errors/` | Preserves GrooveSkills modularity without forcing backend `src/actions/` or `src/routes/` layout; existing multi-export files (`utils/fs.mjs`, `commands/add.mjs`) remain documented debt for future tasks |
| 2026-11-17 | Centralized CLI Error & Input Boundary | Standardize on an `AppError` hierarchy + top-level normalizer in `index.mjs` and strict CLI input validation | Prevents path traversal / invalid app names and replaces ad-hoc `console.error` + `process.exit(1)` calls on future edits |
| 2026-11-17 | `pnpm` + `node --test` + `prettier --check` Standard | Standardize this CLI repo on `pnpm`, targeting `node --test` and `prettier --check` as verification gates | Aligns CLI repo tooling with generated monorepos; scripts and dependency installation deferred until explicitly requested |
| 2026-11-17 | Scoped Skill Applicability | Classify universal/CLI skills as active and web/HTTP/DB domain skills as N/A unless scope expands | Keeps guidance relevant to CLI development without diluting backend standards if the project later grows |
| 2026-11-17 | Full English & Descriptive Naming Alignment | Standardize `package.json` metadata, CLI copy, and docs to English (`en`), and enforce descriptive identifiers (`no s/e/pkg`) | Resolves Spanish `package.json` description and short-identifier debt incrementally when touching files |
| 2026-11-24 | Retain Local `errors/app-error.mjs` Over `@3lineas/groovepack/errors` | Keep the lightweight local `AppError` (`exitCode`-based) in `errors/app-error.mjs` instead of adding `@3lineas/groovepack` as a runtime dependency | Avoids unnecessary runtime dependency overhead for a standalone Node.js CLI while keeping GroovePack-aligned `AppError` semantics |
