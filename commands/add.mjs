import { outro, spinner, confirm, isCancel, cancel } from "@clack/prompts";
import { downloadTemplate } from "giget";
import fs from "node:fs/promises";
import path from "node:path";
import color from "picocolors";
import { renameApp } from "./rename.mjs";
import { execa } from "execa";

/**
 * Scans the apps directory and finds the next available port starting from 3000.
 * Assumes port 3000 for Next.js apps that don't explicitly specify a port.
 * @returns {Promise<number>} The next available port number.
 */
async function getNextAvailablePort() {
  const appsDir = path.join(process.cwd(), "apps");
  let entries = [];
  try {
    entries = await fs.readdir(appsDir, { withFileTypes: true });
  } catch (e) {
    return 3000;
  }

  const usedPorts = new Set();

  for (const entry of entries) {
    if (entry.isDirectory()) {
      try {
        const pkgPath = path.join(appsDir, entry.name, "package.json");
        const pkgContent = await fs.readFile(pkgPath, "utf-8");
        const pkg = JSON.parse(pkgContent);

        if (pkg.scripts && pkg.scripts.dev) {
          const match = pkg.scripts.dev.match(/(?:-p|--port)\s+(\d+)/);
          if (match && match[1]) {
            usedPorts.add(parseInt(match[1], 10));
          } else {
            if (
              (pkg.dependencies && pkg.dependencies.next) ||
              (pkg.devDependencies && pkg.devDependencies.next)
            ) {
              usedPorts.add(3000);
            }
          }
        }
      } catch (e) {
        // Ignore if no package.json or error reading
      }
    }
  }

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
  const s = spinner();
  const targetDir = path.join(process.cwd(), "apps", name);
  const webAppPath = path.join(process.cwd(), "apps", "web");

  try {
    await fs.access(path.join(process.cwd(), "apps"));
  } catch (e) {
    console.error(
      color.red(
        "❌ 'apps' directory not found. Make sure you are at the root of your monorepo.",
      ),
    );
    process.exit(1);
  }

  try {
    await fs.access(targetDir);
    console.error(color.red(`❌ The directory apps/${name} already exists.`));
    process.exit(1);
  } catch (e) {
    // Continue if directory doesn't exist
  }

  let webExists = false;
  try {
    await fs.access(webAppPath);
    webExists = true;
  } catch (e) {
    webExists = false;
  }

  if (webExists) {
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
    const pkgContent = await fs.readFile(pkgPath, "utf-8");
    const pkg = JSON.parse(pkgContent);

    pkg.name = name;

    const nextPort = await getNextAvailablePort();

    if (pkg.scripts && pkg.scripts.dev) {
      if (pkg.scripts.dev.includes("-p ")) {
        pkg.scripts.dev = pkg.scripts.dev.replace(/-p\s+\d+/, `-p ${nextPort}`);
      } else {
        pkg.scripts.dev = `${pkg.scripts.dev} -p ${nextPort}`;
      }
    }

    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));

    s.stop(`✨ App "${name}" created on port ${nextPort}!`);

    const install = await confirm({
      message: "📦 Do you want to install dependencies now? (Recommended)",
    });

    if (install) {
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
