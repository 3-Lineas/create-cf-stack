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
import fs from "node:fs/promises";
import path from "node:path";
import color from "picocolors";

/**
 * Orchestrates the creation of a new project from a template.
 * Prompts for project name, downloads template, configures package.json,
 * installs dependencies (optional), and initializes Git (optional).
 * @returns {Promise<void>}
 */
export async function createProject() {
  intro(
    color.bgCyan(
      color.black(" 🚀 crear-cf-stack - El comienzo de algo grande "),
    ),
  );

  const projectName = await text({
    message: "📂 ¿Cómo llamaremos a tu nueva aventura?",
    placeholder: "mi-app-increible",
    defaultValue: "mi-app-increible",
  });

  if (isCancel(projectName)) {
    cancel("❌ Operación cancelada. ¡Vuelve pronto!");
    process.exit(0);
  }

  const s = spinner();
  s.start("📥 Descargando la magia de la nube...");

  try {
    await downloadTemplate(
      "gh:3-Lineas/Template-Turborepo-Hono-Next-Cloudflare-Dizzler-Shadcn",
      {
        dir: projectName,
        force: true,
      },
    );

    s.stop("✨ ¡Plantilla descargada con éxito!");
  } catch (error) {
    s.stop("💥 Explotó algo al descargar la plantilla.");
    console.error(error);
    process.exit(1);
  }

  s.start("⚙️  Ajustando los engranajes...");
  const projectPath = path.join(process.cwd(), projectName);

  try {
    const pkgPath = path.join(projectPath, "package.json");
    const pkgContent = await fs.readFile(pkgPath, "utf-8");
    const pkg = JSON.parse(pkgContent);

    pkg.name = projectName;

    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));

    s.stop("🔧 Configuración base lista.");
  } catch (error) {
    s.stop("😱 Error durante la configuración.");
    console.error(error);
  }

  const install = await confirm({
    message: "📦 ¿Quieres instalar las dependencias ahora? (Recomendado)",
  });

  if (isCancel(install)) {
    cancel("❌ Operación cancelada.");
    process.exit(0);
  }

  if (install) {
    s.start("☕ Ve por un café, esto tomará unos segundos...");
    await execa("pnpm", ["install"], { cwd: projectPath });
    s.stop("🎉 ¡Dependencias instaladas!");
  }

  const initGit = await confirm({
    message: "🐙 ¿Inicializamos un repositorio de Git?",
  });

  if (isCancel(initGit)) {
    cancel("❌ Operación cancelada.");
    process.exit(0);
  }

  if (initGit) {
    s.start("🌱 Plantando las semillas de Git...");
    try {
      await execa("git", ["init"], { cwd: projectPath });
      await execa("git", ["add", "."], { cwd: projectPath });
      await execa("git", ["commit", "-m", "Initial commit"], {
        cwd: projectPath,
      });
      s.stop("🌳 Git inicializado y primer commit creado.");
    } catch (e) {
      s.stop("🥀 No se pudo inicializar Git.");
    }
  }

  outro(
    color.green(
      `🚀 ¡Todo listo! Tu nave espacial está esperando en ./${projectName}`,
    ),
  );

  console.log(`\n👾 Siguientes pasos para el despegue:\n`);
  console.log(color.cyan(`  cd ${projectName}`));
  if (!install) {
    console.log(color.cyan(`  pnpm install`));
  }
  console.log(color.cyan(`  pnpm db:generate`));
  console.log(color.cyan(`  pnpm migrate:local`));
  console.log(color.cyan(`  pnpm dev`));
  console.log(`\n🌟 ¡A programar se ha dicho!\n`);
}
