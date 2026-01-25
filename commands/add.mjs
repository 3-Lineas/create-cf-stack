import { outro, spinner, confirm, isCancel, cancel } from "@clack/prompts";
import { downloadTemplate } from "giget";
import fs from "node:fs/promises";
import path from "node:path";
import color from "picocolors";
import { renameApp } from "./rename.mjs";

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
          // Busca -p 3000 o --port 3000
          const match = pkg.scripts.dev.match(/(?:-p|--port)\s+(\d+)/);
          if (match && match[1]) {
            usedPorts.add(parseInt(match[1], 10));
          } else {
            // Si no tiene puerto explícito, pero es Next.js, asume 3000
            if (
              (pkg.dependencies && pkg.dependencies.next) ||
              (pkg.devDependencies && pkg.devDependencies.next)
            ) {
              usedPorts.add(3000);
            }
          }
        }
      } catch (e) {
        // Ignorar si no hay package.json o error de lectura
      }
    }
  }

  let port = 3000;
  while (usedPorts.has(port)) {
    port++;
  }
  return port;
}

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

    // Asignar puerto disponible
    const nextPort = await getNextAvailablePort();
    if (pkg.scripts && pkg.scripts.dev) {
      if (pkg.scripts.dev.match(/(?:-p|--port)\s+\d+/)) {
        pkg.scripts.dev = pkg.scripts.dev.replace(
          /(?:-p|--port)\s+\d+/,
          `-p ${nextPort}`,
        );
      } else {
        pkg.scripts.dev += ` -p ${nextPort}`;
      }
    }

    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));

    s.stop(
      `🔧 App '${name}' configurada correctamente en el puerto ${nextPort}.`,
    );

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
