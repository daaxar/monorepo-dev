#!/usr/bin/env node
import chalk from "chalk";
import { Command } from "commander";
import inquirer from "inquirer";
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { runBuild } from "./commands/build";
import { runDeploy } from "./commands/deploy";
import {
  detectProject,
  findMonorepoRoot,
  listProjects,
  detectProjectKind,
  deriveDockerTagFromPath,
} from "./utils";

const program = new Command();

async function ensureProjectContext(
  callback: (projectPath: string, monorepoRoot: string) => void,
) {
  const monorepoRoot = findMonorepoRoot();
  const detectedProject = detectProject(monorepoRoot);
  if (detectedProject) {
    callback(detectedProject, monorepoRoot);
    return;
  }
  console.log(
    chalk.yellow("⚠ Not inside a project. Please select one from the list."),
  );
  const projects = listProjects();
  if (projects.length === 0) {
    console.error(chalk.red("❌ No projects found in workspaces."));
    process.exit(1);
  }
  const { selectedProject } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedProject",
      message: "Select a project:",
      choices: projects,
    },
  ]);
  callback(selectedProject, monorepoRoot);
}

program
  .name("Dx")
  .version("1.0.0")
  .description("CLI tool for managing projects in a monorepo");

program
  .command("build")
  .description("Builds the project bundle")
  .action(() => ensureProjectContext(runBuild));

program
  .command("deploy")
  .option(
    "-d, --diff",
    "Compare deployed stack with local changes (shows the difference)",
  )
  .option("-i, --init", "Initialize the CDK environment (runs 'cdk bootstrap')")
  .option(
    "-p, --preview",
    "Generate and display the CloudFormation template (runs 'cdk synth')",
  )
  .description("Deploys the project using AWS Cloud Development Kit (CDK)")
  .action((options) =>
    ensureProjectContext((project, monorepoRoot) =>
      runDeploy(project, monorepoRoot, options),
    )
      .then(() => console.log(chalk.green("✅ Deployment successful!")))
      .catch((error: any) => {
        console.error(error.message);
        process.exit(error.code || -1);
      }),
  );

program
  .command("artifact")
  .description("Genera artefacto (Docker image) para el proyecto")
  .option("-t, --tag <tag>", "Tag de imagen Docker (auto si no se provee)")
  .option(
    "-P, --project <relativePath>",
    "Ruta relativa al root del monorepo (override)",
  )
  .option("-H, --handler <handler>", "Handler para Lambda", "index.handler")
  .option("--dev", "Incluir dependencias dev")
  .option("--no-cache", "Forzar reconstrucción sin cache")
  .action((options) =>
    ensureProjectContext((autoProject, monorepoRoot) => {
      const project = options.project || autoProject;
      const kind = detectProjectKind(project);
      const tag = options.tag || deriveDockerTagFromPath(project);
      if (kind === "lambda") {
        const functionPath = project.replace(/^funcs\//, "");
        const dockerfile = path.join(monorepoRoot, "funcs", "Dockerfile");
        if (!fs.existsSync(dockerfile)) {
          console.error(chalk.red("❌ No se encontró funcs/Dockerfile"));
          process.exit(2);
        }
        const buildArgs = [
          "build",
          "-f",
          dockerfile,
          "--build-arg",
          `FUNCTION_PATH=${functionPath}`,
          "--build-arg",
          `HANDLER=${options.handler}`,
          "--build-arg",
          `INSTALL_DEV=${options.dev ? "true" : "false"}`,
          "-t",
          tag,
        ];
        if (options.noCache) buildArgs.push("--no-cache");
        buildArgs.push(monorepoRoot);
        console.log(chalk.blue(`🔨 docker ${buildArgs.join(" ")}`));
        const res = spawnSync("docker", buildArgs, { stdio: "inherit" });
        if (res.status !== 0) {
          console.error(chalk.red("❌ Falló la generación del artefacto"));
          process.exit(res.status || 1);
        }
        console.log(chalk.green(`✅ Imagen construida: ${tag}`));
      } else {
        console.error(
          chalk.red("Tipo de proyecto aún no soportado para artifact"),
        );
        process.exit(3);
      }
    }),
  );

program
  .command("run")
  .description("Ejecuta localmente el artefacto (Lambda docker run)")
  .option("-P, --project <relativePath>", "Ruta relativa (override)")
  .option("-t, --tag <tag>", "Tag de la imagen (auto derivado si no)")
  .option("-p, --port <port>", "Puerto local", "9000")
  .action((options) =>
    ensureProjectContext((autoProject, monorepoRoot) => {
      const project = options.project || autoProject;
      const kind = detectProjectKind(project);
      const tag = options.tag || deriveDockerTagFromPath(project);
      if (kind === "lambda") {
        const runArgs = ["run", "-p", `${options.port}:8080`, tag];
        const res = spawnSync("docker", runArgs, { stdio: "inherit" });
        process.exit(res.status || 0);
      } else {
        console.error(chalk.red("Tipo de proyecto aún no soportado para run"));
        process.exit(4);
      }
    }),
  );

if (!process.argv.slice(2).length) {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "Choose action",
        choices: ["build", "deploy", "artifact", "run", "Exit"],
      },
    ])
    .then((a) => {
      if (a.action === "Exit") process.exit(0);
      program.parse([process.argv[0], process.argv[1], a.action]);
    });
} else {
  program.parse(process.argv);
}
