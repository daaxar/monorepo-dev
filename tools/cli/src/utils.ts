import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";

export function findMonorepoRoot(): string {
  let currentDir = process.cwd();

  while (currentDir !== path.parse(currentDir).root) {
    const packageJsonPath = path.join(currentDir, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      if (packageJson.workspaces) {
        return currentDir; // Found monorepo root
      }
    }
    currentDir = path.dirname(currentDir);
  }

  console.error(chalk.red("❌ Could not find the monorepo root."));
  process.exit(1);
}

export function detectProject(monorepoRoot: string | null): string | null {
  let currentDir = process.cwd();
  while (currentDir !== monorepoRoot) {
    if (fs.existsSync(path.join(currentDir, "package.json"))) {
      return path.relative(monorepoRoot, currentDir); // Return relative path
    }
    currentDir = path.dirname(currentDir);
  }

  return null;
}

export function listProjects(): string[] {
  const monorepoRoot = findMonorepoRoot();
  if (!monorepoRoot) {
    console.error(chalk.red("❌ Could not find the monorepo root."));
    process.exit(1);
  }

  const rootPackageJsonPath = path.join(monorepoRoot, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, "utf-8"));

  if (!packageJson.workspaces || !Array.isArray(packageJson.workspaces)) {
    console.error(chalk.red("❌ No workspaces found in package.json."));
    process.exit(1);
  }

  const projects: string[] = [];

  packageJson.workspaces.forEach((pattern: string) => {
    const workspacePath = path.join(monorepoRoot, pattern.replace("/*", ""));
    if (fs.existsSync(workspacePath)) {
      const subdirs = fs.readdirSync(workspacePath);
      subdirs.forEach((subdir: string) => {
        const projectPath = path.join(workspacePath, subdir);
        if (fs.existsSync(path.join(projectPath, "package.json"))) {
          projects.push(path.relative(monorepoRoot, projectPath)); // Store relative path
        }
      });
    }
  });

  return projects;
}
