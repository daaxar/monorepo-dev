import * as esbuild from "esbuild";
import * as path from "path";
import chalk from "chalk";

export async function runBuild(projectSubPath: string, monorepoRoot: string) {
  console.log(
    chalk.blue(`🚀 Building project: ${chalk.green(projectSubPath)}...`),
  );
  const projectPath = path.join(monorepoRoot, projectSubPath);
  const outputPath = path.join(projectPath, "dist");
  const entryFile = path.join(projectPath, "src/index.ts");

  await esbuild.build({
    entryPoints: [entryFile],
    outfile: path.join(outputPath, "index.js"),
    bundle: true,
    minify: false,
    platform: "node",
    target: "node22",
    external: ["aws-sdk", "esbuild"],
    format: "cjs",
    sourcemap: "both",
    loader: {
      ".json": "json",
    },
  });

  console.log(chalk.green("✅ Build completed!"));
}
