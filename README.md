# `create-cf-stack` 🚀

Interactive CLI to quickly initialize a new project based on the **Cloudflare + Next.js + Hono (Turborepo)** stack.

This package is part of the monorepo and allows you to automatically download and configure the official template.

## Features ✨

- 📥 **Automatic Download**: Clones the latest version of the [Template-Turborepo-Hono-Next-Cloudflare-Dizzler-Shadcn](https://github.com/3-Lineas/Template-Turborepo-Hono-Next-Cloudflare-Dizzler-Shadcn) template.
- 🛠 **Zero Config**: Renames the project and adjusts configuration files for you.
- 📦 **Dependency Management**: Option to automatically install dependencies with `pnpm`.
- 🐙 **Git Ready**: Initializes a Git repository and performs the first commit.
- 🎨 **Friendly UI**: Fun and easy-to-use command-line interface (powered by `@clack/prompts`).

## Usage 💻

### From Registry

```bash
pnpm create @3lineas/cf-stack
# or
npx @3lineas/create-cf-stack
```

### Add a New Web Application

If you are already inside a monorepo created with this stack and want to add a new Next.js application (based on the `apps/web` template):

```bash
npx @3lineas/create-cf-stack add [app-name]
```

This will download a fresh copy of `apps/web` from the remote repository and configure it in `apps/[app-name]`.

### Help

To see available commands:

```bash
npx @3lineas/create-cf-stack help
```

## Generated Project Structure

The created project will have the following basic monorepo structure:

```
my-new-project/
├── apps/
│   ├── api/          # Hono Backend (Cloudflare Workers)
│   └── web/          # Next.js Frontend (Cloudflare Pages/Workers)
├── packages/
│   ├── db/           # Drizzle Schema and D1 connection
│   └── ui/           # Shared components (shadcn/ui)
├── package.json
└── turbo.json
```

## Stack Technologies 🛠

The generated project includes the following technologies configured and ready to use:

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router) + [React 19](https://react.dev/).
- **Backend**: [Hono](https://hono.dev/) (Cloudflare Workers).
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite on the Edge).
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/).
- **UI**: [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/).
- **Monorepo**: [Turborepo](https://turbo.build/).
- **Deployment**: Cloudflare Workers.

## Credits 👨‍💻

Developed by **Diego Nelson** for [3 Lineas](https://3lineas.com).
