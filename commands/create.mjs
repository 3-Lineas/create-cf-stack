import { intro, text, outro, spinner, isCancel, cancel } from "@clack/prompts";
import { downloadTemplate } from "giget";
import path from "node:path";
import color from "picocolors";
import { readJson } from "#utils/fs/read-json.mjs";
import { writeJson } from "#utils/fs/write-json.mjs";
import { validatePackageName } from "#utils/validation/validate-package-name.mjs";
import { installDependencies } from "#utils/package-manager/install-dependencies.mjs";
import { initializeGitRepository } from "#utils/git/initialize-git-repository.mjs";
import { TemplateDownloadError } from "#errors/template/template-download.error.mjs";

const TEMPLATE_SOURCE =
  "gh:3-Lineas/Template-Turborepo-Hono-Next-Cloudflare-Dizzler-Shadcn";

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

  const rawProjectName = await text({
    message: "📂 What should we call your new adventure?",
    placeholder: "my-awesome-app",
    defaultValue: "my-awesome-app",
    validate(inputValue) {
      try {
        validatePackageName(inputValue, process.cwd());
        return undefined;
      } catch (caughtError) {
        return caughtError instanceof Error
          ? caughtError.message
          : "Invalid project name.";
      }
    },
  });

  if (isCancel(rawProjectName)) {
    cancel("❌ Operation cancelled. See you soon!");
    process.exit(0);
  }

  const projectName = validatePackageName(rawProjectName, process.cwd());
  const projectPath = path.join(process.cwd(), projectName);
  const downloadSpinner = spinner();
  downloadSpinner.start("📥 Downloading cloud magic...");

  try {
    await downloadTemplate(TEMPLATE_SOURCE, {
      dir: projectName,
      force: true,
    });
    downloadSpinner.stop("✨ Template downloaded successfully!");
  } catch (caughtError) {
    downloadSpinner.stop(
      "💥 Something exploded while downloading the template.",
    );
    throw new TemplateDownloadError(
      `Failed to download template into "${projectName}".`,
      { cause: caughtError },
    );
  }

  downloadSpinner.start("⚙️  Adjusting the gears...");
  try {
    const packageJsonPath = path.join(projectPath, "package.json");
    const packageJson = await readJson(packageJsonPath);
    packageJson.name = projectName;
    await writeJson(packageJsonPath, packageJson);
    downloadSpinner.stop("🔧 Base configuration ready.");
  } catch (caughtError) {
    downloadSpinner.stop("😱 Error during configuration.");
    throw caughtError;
  }

  await installDependencies(projectPath);
  await initializeGitRepository(projectPath);

  outro(`🎉 Project ${color.cyan(projectName)} is ready!`);
  console.log(`
  ${color.yellow("Next steps:")}
  ${color.cyan(`1. cd ${projectName}`)}
  ${color.cyan("2. pnpm dev")}
  `);
}
