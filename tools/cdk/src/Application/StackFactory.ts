import { Construct } from "constructs";
import { Stack, StackProps } from "aws-cdk-lib";
import { IStackFactory } from "../Domain/Ports/IStackFactory";
import { StackConfig } from "../Domain/Entities/StackConfig";
import { BuilderFactory } from "./Builders/BuilderFactory";
import { AwsCdkAdapter } from "../Infrastructure/AwsCdkAdapter";
import { convertStackSettingsToProps } from "./Shared/utils";

export class StackFactory extends Stack implements IStackFactory {
  private builderFactory: BuilderFactory;

  constructor(
    private readonly scope: Construct,
    private readonly config: StackConfig,
    private cdkAdapter: AwsCdkAdapter,
  ) {
    super(scope, config.stackName, convertStackSettingsToProps(config));
    this.builderFactory = new BuilderFactory(cdkAdapter);
  }

  async create(config: StackConfig): Promise<void> {
    for (const stack of config.stacks) {
      const builder = this.builderFactory
        .createLambdaBuilder()
        .withFunctionName(stack.functionName)
        .withHandler(stack.handler)
        .withCodePath(stack.codePath)
        .withRuntime(stack.runtime)
        .withMemorySize(stack.memorySize)
        .withTimeout(stack.timeoutSeconds)
        .withEnvironment(stack.environment)
        .withVpc(stack.vpcId, stack.createVpc)
        .withLayers(stack.layers || [])
        .withUrl(stack.enableUrl || false)
        .withLogGroup(stack.logGroup);

      if (stack.withoutAlarms) builder.withoutAlarms();

      const lambdaFn = await builder.build(this);

      if (lambdaFn)
        this.cdkAdapter.addOutput(this, `${stack.functionName}FunctionArn`, {
          value: lambdaFn.functionArn,
          description: "Lambda Function ARN",
        });
    }
  }
}
