import { outro, spinner, confirm, isCancel, cancel } from "@clack/prompts";
import { downloadTemplate } from "giget";
import path from "node:path";
import color from "picocolors";
import { renameApp } from "#commands/rename.mjs";
import { pathExists } from "#utils/fs/path-exists.mjs";
import { readJson } from "#utils/fs/read-json.mjs";
import { writeJson } from "#utils/fs/write-json.mjs";
import { validatePackageName } from "#utils/validation/validate-package-name.mjs";
import { getNextAvailablePort } from "#utils/monorepo/get-next-available-port.mjs";
import { installDependencies } from "#utils/package-manager/install-dependencies.mjs";
import { DirectoryNotFoundError } from "#errors/monorepo/directory-not-found.error.mjs";
import { AppAlreadyExistsError } from "#errors/monorepo/app-already-exists.error.mjs";
import { TemplateDownloadError } from "#errors/template/template-download.error.mjs";

const APP_TEMPLATE_SOURCE =
  "gh:3-Lineas/Template-Turborepo-Hono-Next-Cloudflare-Dizzler-Shadcn/apps/web";

/**
 * Adds a new application to the monorepo from a template.
 * If apps/web exists, offers to rename it instead of downloading.
 * Assigns an available port and optionally installs dependencies.
 * @param {string} appName - The name of the new application.
 * @returns {Promise<void>}
 */
export async function addApp(appName) {
  const appsDirectory = path.join(process.cwd(), "apps");
  const validatedAppName = validatePackageName(appName, appsDirectory);
  const targetDirectory = path.join(appsDirectory, validatedAppName);
  const webAppPath = path.join(appsDirectory, "web");

  if (!(await pathExists(appsDirectory))) {
    throw new DirectoryNotFoundError(
      "'apps' directory not found. Make sure you are at the root of your monorepo.",
      { appsDirectory },
    );
  }

  if (await pathExists(targetDirectory)) {
    throw new AppAlreadyExistsError(
      `The directory apps/${validatedAppName} already exists.`,
      { targetDirectory },
    );
  }

  if (await pathExists(webAppPath)) {
    const shouldRename = await confirm({
      message: `📦 Existing app 'apps/web' detected. Do you want to rename it to '${validatedAppName}' instead?`,
    });

    if (isCancel(shouldRename)) {
      cancel("❌ Operation cancelled.");
      process.exit(0);
    }

    if (shouldRename) {
      await renameApp("web", validatedAppName);
      outro(`✅ App renamed to ${color.cyan(validatedAppName)} successfully.`);
      return;
    }
  }

  const downloadSpinner = spinner();
  downloadSpinner.start(`🚀 Adding new app "${validatedAppName}"...`);

  try {
    await downloadTemplate(APP_TEMPLATE_SOURCE, {
      dir: targetDirectory,
      force: true,
    });
  } catch (caughtError) {
    downloadSpinner.stop("💥 Error downloading the app template.");
    throw new TemplateDownloadError(
      `Failed to download app template for "${validatedAppName}".`,
      { cause: caughtError },
    );
  }

  const packageJsonPath = path.join(targetDirectory, "package.json");
  const packageJson = await readJson(packageJsonPath);
  packageJson.name = validatedAppName;

  const nextPort = await getNextAvailablePort(process.cwd());

  if (packageJson.scripts?.dev) {
    if (packageJson.scripts.dev.includes("-p ")) {
      packageJson.scripts.dev = packageJson.scripts.dev.replace(
        /-p\s+\d+/,
        `-p ${nextPort}`,
      );
    } else {
      packageJson.scripts.dev = `${packageJson.scripts.dev} -p ${nextPort}`;
    }
  }

  await writeJson(packageJsonPath, packageJson);
  downloadSpinner.stop(
    `✨ App "${validatedAppName}" created on port ${nextPort}!`,
  );

  const installed = await installDependencies(process.cwd(), {
    exitOnCancel: false,
  });

  outro(
    `🎉 New app ${color.cyan(validatedAppName)} added! ${
      !installed ? color.yellow("(Don't forget to run pnpm install)") : ""
    }`,
  );
}
