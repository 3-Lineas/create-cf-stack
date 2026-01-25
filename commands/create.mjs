import {
  intro,
  text,
  outro,
  spinner,
  isCancel,
  cancel,
  confirm,
} from "@clack/prompts";
import { downloadTemplate } from "giget";
import { execa } from "execa";
import path from "node:path";
import color from "picocolors";
import { readJson, writeJson } from "../utils/fs.mjs";

/**
 * Orchestrates the creation of a new project from a template.
 * Prompts for project name, downloads template, configures package.json,
 * installs dependencies (optional), and initializes Git (optional).
 * @returns {Promise<void>}
 */
export async function createProject() {
  intro(
    color.bgCyan(
      color.black(" 🚀 create-cf-stack - The beginning of something great "),
    ),
  );

  const projectName = await text({
    message: "📂 What should we call your new adventure?",
    placeholder: "my-awesome-app",
    defaultValue: "my-awesome-app",
  });

  if (isCancel(projectName)) {
    cancel("❌ Operation cancelled. See you soon!");
    process.exit(0);
  }

  const s = spinner();
  s.start("📥 Downloading cloud magic...");

  try {
    await downloadTemplate(
      "gh:3-Lineas/Template-Turborepo-Hono-Next-Cloudflare-Dizzler-Shadcn",
      {
        dir: projectName,
        force: true,
      },
    );

    s.stop("✨ Template downloaded successfully!");
  } catch (error) {
    s.stop("💥 Something exploded while downloading the template.");
    console.error(error);
    process.exit(1);
  }

  s.start("⚙️  Adjusting the gears...");
  const projectPath = path.join(process.cwd(), projectName);

  try {
    const pkgPath = path.join(projectPath, "package.json");
    const pkg = await readJson(pkgPath);

    pkg.name = projectName;

    await writeJson(pkgPath, pkg);

    s.stop("🔧 Base configuration ready.");
  } catch (error) {
    s.stop("😱 Error during configuration.");
    console.error(error);
    // Don't exit here, maybe the user can still use the project
  }

  const install = await confirm({
    message: "📦 Do you want to install dependencies now? (Recommended)",
  });

  if (isCancel(install)) {
    cancel("❌ Operation cancelled.");
    process.exit(0);
  }

  if (install) {
    s.start("☕ Grab a coffee, this will take a few seconds...");
    await execa("pnpm", ["install"], { cwd: projectPath });
    s.stop("🎉 Dependencies installed!");
  }

  const initGit = await confirm({
    message: "🐙 Initialize a Git repository?",
  });

  if (isCancel(initGit)) {
    cancel("❌ Operation cancelled.");
    process.exit(0);
  }

  if (initGit) {
    try {
      await execa("git", ["init"], { cwd: projectPath });
      await execa("git", ["add", "."], { cwd: projectPath });
      await execa("git", ["commit", "-m", "chore: initial commit"], {
        cwd: projectPath,
      });
      s.stop("✅ Git repository initialized.");
    } catch (e) {
      s.stop("⚠️ Could not initialize Git.");
    }
  }

  outro(`🎉 Project ${color.cyan(projectName)} is ready!`);
  console.log(`
  ${color.yellow("Next steps:")}
  ${color.cyan(`1. cd ${projectName}`)}
  ${color.cyan("2. pnpm dev")}
  `);
}
