import { execSync } from "child_process";
import chalk from "chalk";
import * as path from "path";

export function runDeploy(
  projectSubPath: string,
  monorepoRoot: string,
  options: { init?: boolean; preview?: boolean; diff?: boolean },
) {
  try {
    console.log(
      chalk.blue(`🚀 Deploying project: ${chalk.green(projectSubPath)}...`),
    );
    const projectPath = path.join(monorepoRoot, projectSubPath);
    const cdkAppPath = path.join(monorepoRoot, "tools/cdk/dist/index.js");

    const commands = [];
    const params = [
      `--app="${cdkAppPath}"`,
      process.env.AWS_PROFILE ? `--profile=${process.env.AWS_PROFILE}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    if (options.init) {
      commands.push(`cdk bootstrap ${params}`);
    } else if (options.preview) {
      commands.push(`cdk context ${params} --clear`);
      commands.push(`cdk synth ${params}`);
    } else if (options.diff) {
      commands.push(`cdk context ${params} --clear`);
      commands.push(`cdk diff ${params}`);
    } else {
      commands.push(`cdk context ${params} --clear`);
      commands.push(`cdk deploy ${params}`);
    }
    for (let c = 0; c < commands.length; c += 1) {
      execSync(commands[c], { cwd: projectPath, stdio: "inherit" });
    }

    console.log(chalk.green("✅ Deployment completed!"));
  } catch (error: any) {
    console.error(chalk.red("❌ Deployment failed!"));
    throw error;
  }
}
