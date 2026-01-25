import { outro, spinner, confirm, isCancel, cancel } from "@clack/prompts";
import { downloadTemplate } from "giget";
import fs from "node:fs/promises";
import path from "node:path";
import color from "picocolors";
import { renameApp } from "./rename.mjs";
import { execa } from "execa";
import { pathExists, readJson, writeJson } from "../utils/fs.mjs";

/**
 * Scans the apps directory and finds the next available port starting from 3000.
 * Assumes port 3000 for Next.js apps that don't explicitly specify a port.
 * @returns {Promise<number>} The next available port number.
 */
async function getNextAvailablePort() {
  const appsDir = path.join(process.cwd(), "apps");

  if (!(await pathExists(appsDir))) {
    return 3000;
  }

  const entries = await fs.readdir(appsDir, { withFileTypes: true });
  const usedPorts = new Set();

  await Promise.all(
    entries.map(async (entry) => {
      if (!entry.isDirectory()) return;

      const pkgPath = path.join(appsDir, entry.name, "package.json");
      if (!(await pathExists(pkgPath))) return;

      try {
        const pkg = await readJson(pkgPath);

        if (!pkg.scripts?.dev) return;

        const match = pkg.scripts.dev.match(/(?:-p|--port)\s+(\d+)/);
        if (match && match[1]) {
          usedPorts.add(parseInt(match[1], 10));
          return;
        }

        const hasNext = pkg.dependencies?.next || pkg.devDependencies?.next;
        if (hasNext) {
          usedPorts.add(3000);
        }
      } catch {
        // Ignore errors reading package.json
      }
    }),
  );

  let port = 3000;
  while (usedPorts.has(port)) {
    port++;
  }
  return port;
}

/**
 * Adds a new application to the monorepo from a template.
 * If apps/web exists, offers to rename it instead of downloading.
 * Assigns an available port and optionally installs dependencies.
 * @param {string} name - The name of the new application.
 * @returns {Promise<void>}
 */
export async function addApp(name) {
  const appsPath = path.join(process.cwd(), "apps");
  const targetDir = path.join(appsPath, name);
  const webAppPath = path.join(appsPath, "web");

  if (!(await pathExists(appsPath))) {
    console.error(
      color.red(
        "❌ 'apps' directory not found. Make sure you are at the root of your monorepo.",
      ),
    );
    process.exit(1);
  }

  if (await pathExists(targetDir)) {
    console.error(color.red(`❌ The directory apps/${name} already exists.`));
    process.exit(1);
  }

  if (await pathExists(webAppPath)) {
    const shouldRename = await confirm({
      message: `📦 Existing app 'apps/web' detected. Do you want to rename it to '${name}' instead?`,
    });

    if (isCancel(shouldRename)) {
      cancel("❌ Operation cancelled.");
      process.exit(0);
    }

    if (shouldRename) {
      await renameApp("web", name);
      outro(`✅ App renamed to ${color.cyan(name)} successfully.`);
      return;
    }
  }

  const s = spinner();
  s.start(`🚀 Adding new app "${name}"...`);

  try {
    await downloadTemplate(
      "gh:3-Lineas/Template-Turborepo-Hono-Next-Cloudflare-Dizzler-Shadcn/apps/web",
      {
        dir: targetDir,
        force: true,
      },
    );

    const pkgPath = path.join(targetDir, "package.json");
    const pkg = await readJson(pkgPath);

    pkg.name = name;

    const nextPort = await getNextAvailablePort();

    if (pkg.scripts?.dev) {
      if (pkg.scripts.dev.includes("-p ")) {
        pkg.scripts.dev = pkg.scripts.dev.replace(/-p\s+\d+/, `-p ${nextPort}`);
      } else {
        pkg.scripts.dev = `${pkg.scripts.dev} -p ${nextPort}`;
      }
    }

    await writeJson(pkgPath, pkg);

    s.stop(`✨ App "${name}" created on port ${nextPort}!`);

    const install = await confirm({
      message: "📦 Do you want to install dependencies now? (Recommended)",
    });

    if (isCancel(install)) {
      // Don't exit, just finish the command without install
    } else if (install) {
      s.start("☕ Grab a coffee, this will take a few seconds...");
      await execa("pnpm", ["install"], { cwd: process.cwd() });
      s.stop("🎉 Dependencies installed!");
    }

    outro(
      `🎉 New app ${color.cyan(name)} added! ${
        !install ? color.yellow("(Don't forget to run pnpm install)") : ""
      }`,
    );
  } catch (error) {
    s.stop("💥 Error adding the new app.");
    console.error(error);
    process.exit(1);
  }
}
