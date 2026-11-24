# `create-cf-stack`

Interactive CLI to quickly initialize a new project based on the **Cloudflare + Next.js + Hono (Turborepo)** stack.

This package downloads and configures the official [Template-Turborepo-Hono-Next-Cloudflare-Dizzler-Shadcn](https://github.com/3-Lineas/Template-Turborepo-Hono-Next-Cloudflare-Dizzler-Shadcn) monorepo.

## Features

- **Automatic Download**: Clones the latest template via `giget`.
- **Zero Config**: Renames the project and adjusts configuration files automatically.
- **Dependency Management**: Optional automatic dependency installation with `pnpm`.
- **Git Ready**: Optional Git initialization with an initial commit.
- **Friendly UI**: Interactive command-line interface powered by `@clack/prompts`.
- **AI Agent Setup Prompt**: Prints a copy-pasteable GrooveSkills-style prompt after project creation to help your AI agent customize the template and GrooveSkills.

## CLI Usage

### Create a New Project

```bash
pnpm create @3lineas/cf-stack
# or
npx @3lineas/create-cf-stack@latest
```

### Add a New Web Application

Inside an existing monorepo created with this stack, add a new Next.js application (based on `apps/web`) with automatic port assignment or rename an existing `apps/web`:

```bash
npx @3lineas/create-cf-stack add [app-name]
```

### Rename an Existing Application

Rename an application directory under `apps/` and update its `package.json` name:

```bash
npx @3lineas/create-cf-stack rename [current-name] [new-name]
```

### Help

```bash
npx @3lineas/create-cf-stack help
```

## Generated Project Structure

```text
my-new-project/
├── apps/
│   ├── api/                 # Hono REST API & Data Layer (Drizzle ORM + D1)
│   └── web/                 # Next.js 16 App Router Frontend (OpenNext -> Cloudflare Workers)
├── packages/
│   ├── typescript-config/   # Shared TypeScript configurations
│   └── ui/                  # Shared UI components (shadcn/ui)
├── package.json
└── turbo.json
```

## Stack Technologies

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router) + [React 19](https://react.dev/), deployed to Cloudflare Workers via OpenNext, consuming Hono RPC via Cloudflare Service Bindings.
- **Backend**: [Hono](https://hono.dev/) on Cloudflare Workers.
- **Database & ORM**: [Cloudflare D1](https://developers.cloudflare.com/d1/) + [Drizzle ORM](https://orm.drizzle.team/).
- **UI**: [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (`packages/ui`).
- **Monorepo**: [Turborepo](https://turbo.build/) + `pnpm`.

## Monorepo Commands (Root)

| Command            | Description                                            |
| :----------------- | :----------------------------------------------------- |
| `pnpm dev`         | Starts local development for all apps (`web` + `api`). |
| `pnpm build`       | Builds all applications and packages for production.   |
| `pnpm lint`        | Runs the linter across all packages.                   |
| `pnpm format`      | Formats all project files using Prettier.              |
| `pnpm check-types` | Runs TypeScript type-checking across the monorepo.     |

## Database Management (D1 + Drizzle)

| Command               | Description                                                               |
| :-------------------- | :------------------------------------------------------------------------ |
| `pnpm db:generate`    | Generates SQL migrations from Drizzle schema changes (`apps/api/src/db`). |
| `pnpm migrate:local`  | Applies pending migrations to the **local** D1 database.                  |
| `pnpm migrate:remote` | Applies pending migrations to the **remote (production)** D1 database.    |
| `pnpm db:studio`      | Opens Drizzle Studio to inspect and edit the database locally.            |

## App-Specific Commands

### Frontend (`apps/web`)

- `pnpm --filter web dev`: Starts only the frontend in development mode.
- `pnpm --filter web build`: Builds the Next.js application.
- `pnpm --filter web deploy`: Deploys the frontend to Cloudflare Workers.
- `pnpm --filter web preview`: Previews the production build locally.
- `pnpm --filter web cf-typegen`: Generates Cloudflare environment types.

### Backend (`apps/api`)

- `pnpm --filter @repo/api dev`: Starts only the API in development mode with Wrangler.
- `pnpm --filter @repo/api deploy`: Deploys the API to Cloudflare Workers.

## UI Components (`shadcn/ui`)

Shared UI components live in `packages/ui`. Add a new component from the monorepo root:

```bash
pnpm ui:add [component-name]
# Example:
pnpm ui:add button
```

Components are added to `packages/ui/src/components` and imported in `apps/web` from `@repo/ui/components/[name]`.

## Recommended Workflow

1. **Development**: Run `pnpm dev` to start the full monorepo environment.
2. **Database Changes**: Update `apps/api/src/db/schema.ts`, run `pnpm db:generate`, then run `pnpm migrate:local`.
3. **Deployment**: Run `pnpm migrate:remote`, then `pnpm build` and the app deploy commands (or CI/CD).

## Credits

Developed by **Diego Nelson** for [3 Lineas](https://3lineas.com).
