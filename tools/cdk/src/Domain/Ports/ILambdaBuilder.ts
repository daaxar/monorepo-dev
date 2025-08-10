import { Construct } from "constructs";
import { LambdaConfig } from "../Entities/LambdaConfig";

export interface ILambdaBuilder {
  withFunctionName(name: string): ILambdaBuilder;
  withHandler(handler: string): ILambdaBuilder;
  withCodePath(path: string): ILambdaBuilder;
  withRuntime(runtime: string): ILambdaBuilder;
  withMemorySize(size: number): ILambdaBuilder;
  withTimeout(seconds: number): ILambdaBuilder;
  withEnvironment(env: Record<string, string>): ILambdaBuilder;
  withVpc(vpcId?: string, createVpc?: boolean): ILambdaBuilder;
  withLayers(layers: { name: string; deps: string[] }[]): ILambdaBuilder;
  withUrl(enabled: boolean): ILambdaBuilder;
  withLogGroup(group?: string): ILambdaBuilder;
  withoutAlarms(): ILambdaBuilder;
  build(scope: Construct): any;
}
