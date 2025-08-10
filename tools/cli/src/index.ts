#!/usr/bin/env node
import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import { runBuild } from "./commands/build";
import { runDeploy } from "./commands/deploy";
import { detectProject, findMonorepoRoot, listProjects } from "./utils";

const program = new Command();

async function ensureProjectContext(
  callback: (projectPath: string, monorepoRoot: string) => void,
) {
  const monorepoRoot = findMonorepoRoot();
  const detectedProject = detectProject(monorepoRoot);

  if (detectedProject) {
    // console.log(chalk.blue(`📍 Detected project: ${chalk.green(detectedProject)}`));
    callback(detectedProject, monorepoRoot);
  } else {
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
        message: "Select a project to execute the command:",
        choices: projects,
      },
    ]);

    callback(selectedProject, monorepoRoot);
  }
}

program
  .name("Dx")
  .version("1.0.0")
  .description("CLI tool for managing projects in a monorepo");

// Build command
program
  .command("build")
  .description("Builds the project bundle")
  .action(() => ensureProjectContext(runBuild));

// Deploy command
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
      .then(() => {
        console.log(chalk.green("✅ Deployment successful!"));
      })
      .catch((error: any) => {
        console.error(error.message);
        process.exit(error.code || -1);
      }),
  );

// Interactive menu if no command is provided
if (!process.argv.slice(2).length) {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "What do you want to do?",
        choices: ["build", "deploy", "Exit"],
      },
    ])
    .then((answers) => {
      if (answers.action === "Exit") process.exit(0);
      program.parse([process.argv[0], process.argv[1], answers.action]);
    });
} else {
  program.parse(process.argv);
}
