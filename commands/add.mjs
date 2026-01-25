import { outro, spinner, confirm, isCancel, cancel } from "@clack/prompts";
import { downloadTemplate } from "giget";
import fs from "node:fs/promises";
import path from "node:path";
import color from "picocolors";
import { renameApp } from "./rename.mjs";

export async function addApp(name) {
  const s = spinner();
  const targetDir = path.join(process.cwd(), "apps", name);
  const webAppPath = path.join(process.cwd(), "apps", "web");

  // Verificar si la carpeta apps existe
  try {
    await fs.access(path.join(process.cwd(), "apps"));
  } catch (e) {
    console.error(
      color.red(
        "❌ No se encontró la carpeta 'apps'. Asegúrate de estar en la raíz de tu monorepo.",
      ),
    );
    process.exit(1);
  }

  // Verificar si la app ya existe
  try {
    await fs.access(targetDir);
    console.error(color.red(`❌ La carpeta apps/${name} ya existe.`));
    process.exit(1);
  } catch (e) {
    // Si falla, es que no existe, podemos continuar
  }

  // Verificar si existe apps/web
  let webExists = false;
  try {
    await fs.access(webAppPath);
    webExists = true;
  } catch (e) {
    webExists = false;
  }

  if (webExists) {
    const shouldRename = await confirm({
      message: `📦 Se detectó una app existente 'apps/web'. ¿Quieres renombrarla a '${name}' en su lugar?`,
    });

    if (isCancel(shouldRename)) {
      cancel("❌ Operación cancelada.");
      process.exit(0);
    }

    if (shouldRename) {
      await renameApp("web", name);
      outro(color.green(`🚀 ¡App renombrada a apps/${name} exitosamente!`));
      return;
    }
  }

  s.start(`📥 Descargando plantilla de 'web' para crear '${name}'...`);

  try {
    // Descargar solo la carpeta apps/web del repositorio
    await downloadTemplate(
      "gh:3-Lineas/Template-Turborepo-Hono-Next-Cloudflare-Dizzler-Shadcn/apps/web",
      {
        dir: targetDir,
        force: true,
      },
    );

    s.stop("✨ ¡Plantilla descargada con éxito!");
  } catch (error) {
    s.stop("💥 Explotó algo al descargar la plantilla.");
    console.error(error);
    process.exit(1);
  }

  s.start("⚙️  Ajustando package.json...");

  try {
    const pkgPath = path.join(targetDir, "package.json");
    const pkgContent = await fs.readFile(pkgPath, "utf-8");
    const pkg = JSON.parse(pkgContent);

    pkg.name = name;

    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));

    s.stop(`🔧 App '${name}' configurada correctamente.`);

    outro(
      color.green(
        `🚀 ¡Nueva app creada en apps/${name}!\n\nNo olvides ejecutar 'pnpm install' para actualizar dependencias.`,
      ),
    );
  } catch (error) {
    s.stop("😱 Error durante la configuración.");
    console.error(error);
    process.exit(1);
  }
}
