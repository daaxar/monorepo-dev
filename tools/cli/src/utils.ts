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
  if (!monorepoRoot) return null;
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

  const maxDepth = 3;
  const hasPackageJson = (p: string) =>
    fs.existsSync(path.join(p, "package.json"));

  function walk(dir: string, depth: number) {
    if (depth > maxDepth) return;
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return;
    const isPkg = hasPackageJson(dir);
    if (isPkg && depth > 0) {
      projects.push(path.relative(monorepoRoot, dir));
    }
    // Continuar para descubrir paquetes anidados (excepto node_modules)
    const entries = fs.readdirSync(dir);
    for (const e of entries) {
      if (e.startsWith(".") || e === "node_modules" || e === "dist") continue;
      walk(path.join(dir, e), depth + 1);
    }
  }

  packageJson.workspaces.forEach((pattern: string) => {
    const base = pattern.replace(/\/\*.*$/, "");
    const workspacePath = path.join(monorepoRoot, base);
    walk(workspacePath, 0);
  });

  return Array.from(new Set(projects)).sort();
}

export type ProjectKind = "lambda" | "fargate" | "app" | "unknown";

export function detectProjectKind(projectRelativePath: string): ProjectKind {
  if (!projectRelativePath) return "unknown";
  const [segment] = projectRelativePath.split(path.sep);
  switch (segment) {
    case "funcs":
      return "lambda";
    case "servs":
      return "fargate";
    case "app":
    case "apps":
      return "app";
    default:
      return "unknown";
  }
}

export function deriveDockerTagFromPath(projectRelativePath: string): string {
  return projectRelativePath.replace(/\//g, "-").replace(/[^a-zA-Z0-9-_]/g, "");
}
