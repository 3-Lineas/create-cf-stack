import color from "picocolors";
import { intro, outro } from "@clack/prompts";

/**
 * Displays the help message with available commands and usage.
 */
export function showHelp() {
  console.log("");
  intro(color.bgCyan(color.black(" 🚀 create-cf-stack CLI Help ")));

  console.log(`
  ${color.bold("Usage:")}
    ${color.cyan("npx @3lineas/create-cf-stack")} ${color.gray("[command] [options]")}

  ${color.bold("Commands:")}
    ${color.green("(default)")}           Create a new project from the template
    ${color.green("add <name>")}          Add a new Next.js app to the existing monorepo
    ${color.green("rename <old> <new>")}  Rename an existing app in apps/ directory
    ${color.green("help")}                Show this help message

  ${color.bold("Examples:")}
    ${color.gray("# Create a new project")}
    ${color.cyan("npx @3lineas/create-cf-stack")}

    ${color.gray("# Add a new app named 'dashboard'")}
    ${color.cyan("npx @3lineas/create-cf-stack add dashboard")}

    ${color.gray("# Rename 'web' app to 'landing'")}
    ${color.cyan("npx @3lineas/create-cf-stack rename web landing")}
  `);

  outro(color.yellow("Happy coding!"));
}
