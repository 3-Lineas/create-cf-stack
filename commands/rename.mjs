import path from "node:path";
import fs from "node:fs/promises";
import { spinner, outro } from "@clack/prompts";
import color from "picocolors";

export async function renameApp(oldName, newName) {
  const s = spinner();
  const appsDir = path.join(process.cwd(), "apps");
  const oldPath = path.join(appsDir, oldName);
  const newPath = path.join(appsDir, newName);

  s.start(`Renombrando "${oldName}" a "${newName}"...`);

  try {
    // Verificar que la app original existe
    await fs.access(oldPath);
  } catch (e) {
    s.stop(`❌ No se encontró la app "${oldName}" en "apps/".`);
    process.exit(1);
  }

  try {
    // Verificar que el nuevo nombre no esté ocupado
    await fs.access(newPath);
    s.stop(`❌ Ya existe una app llamada "${newName}".`);
    process.exit(1);
  } catch (e) {
    // Si no existe, procedemos
  }

  try {
    // 1. Renombrar carpeta
    await fs.rename(oldPath, newPath);

    // 2. Actualizar package.json
    const pkgPath = path.join(newPath, "package.json");
    const pkgContent = await fs.readFile(pkgPath, "utf-8");
    const pkg = JSON.parse(pkgContent);
    pkg.name = newName;
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));

    s.stop(`✅ App renombrada exitosamente.`);
    
    return true;
  } catch (error) {
    s.stop("💥 Error al renombrar la app.");
    console.error(error);
    process.exit(1);
  }
}
