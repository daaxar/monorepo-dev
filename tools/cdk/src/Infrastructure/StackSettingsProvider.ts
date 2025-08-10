import * as path from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { ISettingsProvider } from "../Domain/Ports/ISettingsProvider";
import { StackConfig } from "../Domain/Entities/StackConfig";

type EnvVariableType = { [key: string]: string };
export class StackSettingsProvider implements ISettingsProvider {
  getConfig(): StackConfig {
    const environment =
      process.env.NODE_ENV === "production" ? "prod" : process.env.ENV || "dev";
    const currentDir = process.cwd();
    const packageJsonPath = path.join(currentDir, "package.json");
    const deployJsonPath = path.join(currentDir, ".deploy.json");

    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    const deployJson = existsSync(deployJsonPath)
      ? JSON.parse(readFileSync(deployJsonPath, "utf-8"))
      : {};

    const outputDir = deployJson.entryPath || "dist";
    const packageName = packageJson.name;
    const stackType = deployJson.type || "lambda";
    const packageNameChunk = packageName.split("/").pop();
    const stackId = this.normalize(
      environment,
      deployJson.id || `${packageNameChunk}Stack`,
    );
    const stackName = this.normalize(
      environment,
      deployJson.stackName ||
        `${
          deployJson.name || packageNameChunk
        }${stackType[0].toUpperCase()}${stackType.slice(1)}`,
    );
    const functionName = this.normalize(
      environment,
      deployJson.functionName ||
        deployJson.name ||
        packageNameChunk ||
        `${stackType}-${randomUUID().split("-")[0]}`,
    );

    return {
      package: { name: packageName, path: currentDir },
      stackName: stackId,
      description: packageJson.description,
      tags: {},
      stacks: [
        {
          functionName,
          handler: deployJson.handler || "index.handler",
          codePath: path.join(currentDir, outputDir),
          runtime: "nodejs22.x",
          memorySize: deployJson.memorySize || 256,
          timeoutSeconds: deployJson.timeout || 10,
          environment: this.getEnvVariables(deployJson.env || []),
          vpcId: deployJson.vpcId,
          createVpc: deployJson.createVpc === true,
          layers: deployJson.dependenciesLayers || [],
          enableUrl: deployJson.enableUrl === true,
          logGroup: deployJson.logGroup,
          withoutAlarms: deployJson.withoutAlarms === true,
        },
      ],
      outputDir,
    };
  }
  private getEnvVariables(env: string[]): EnvVariableType {
    const envVariables: EnvVariableType = {};
    return (env || []).reduce(
      (acc: EnvVariableType, key: string): EnvVariableType => {
        acc[key] = process.env[key] || "";

        return acc;
      },
      envVariables,
    );
  }
  private normalize(...args: string[]): string {
    return args
      .join("-")
      .replace(/[@_/]+/g, "-")
      .replace(/--+/g, "-")
      .replace(/(^-+|-+$)/, "");
  }
}
