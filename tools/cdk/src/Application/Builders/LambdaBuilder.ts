import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Duration } from "aws-cdk-lib";
import { ILambdaBuilder } from "../../Domain/Ports/ILambdaBuilder";
import { AwsCdkAdapter } from "../../Infrastructure/AwsCdkAdapter";

export class LambdaBuilder implements ILambdaBuilder {
  private config: Record<string, any> = {};
  private vpcId?: string;
  private createVpc?: boolean;
  private layersConfig: { name: string; deps: string[] }[] = [];
  private enableUrl: boolean = false;
  private logGroup?: string;
  private noAlarms: boolean = false;

  constructor(private cdkAdapter: AwsCdkAdapter) {}

  withFunctionName(name: string): ILambdaBuilder {
    this.config.functionName = name;
    return this;
  }

  withHandler(handler: string): ILambdaBuilder {
    this.config.handler = handler;
    return this;
  }

  withCodePath(path: string): ILambdaBuilder {
    this.config.code = lambda.Code.fromAsset(path);
    return this;
  }

  withRuntime(runtime: string): ILambdaBuilder {
    this.config.runtime = lambda.Runtime[runtime];
    return this;
  }

  withMemorySize(size: number): ILambdaBuilder {
    this.config.memorySize = size;
    return this;
  }

  withTimeout(seconds: number): ILambdaBuilder {
    this.config.timeout = Duration.seconds(seconds);
    return this;
  }

  withEnvironment(env: Record<string, string>): ILambdaBuilder {
    if (env && Object.keys(env).length > 0) this.config.environment = env;
    return this;
  }

  withVpc(
    vpcId: string = process.env.AWS_VPCID!,
    createVpc: boolean = false,
  ): ILambdaBuilder {
    this.vpcId = vpcId;
    this.createVpc = createVpc;
    return this;
  }

  withLayers(layers: { name: string; deps: string[] }[]): ILambdaBuilder {
    this.layersConfig = layers;
    return this;
  }

  withUrl(enabled: boolean): ILambdaBuilder {
    this.enableUrl = enabled;
    return this;
  }

  withLogGroup(group?: string): ILambdaBuilder {
    this.logGroup = group;
    return this;
  }

  withoutAlarms(): ILambdaBuilder {
    this.noAlarms = true;
    return this;
  }

  async build(scope: Construct): Promise<lambda.Function> {
    if (this.vpcId || this.createVpc) {
      const vpcConfig = await this.cdkAdapter.getVpc(
        scope,
        this.vpcId,
        this.createVpc,
      );
      this.config.vpc = vpcConfig.vpc;
      this.config.securityGroups = vpcConfig.securityGroups;
      this.config.vpcSubnets = vpcConfig.vpcSubnets;
    }

    const layers = await Promise.all(
      this.layersConfig.map((layer) =>
        this.cdkAdapter.createLayer(scope, layer),
      ),
    );
    this.config.layers = layers;
    const lambdaFn = new lambda.Function(scope, this.config.functionName!, {
      ...this.config,
      runtime: this.config.runtime || lambda.Runtime.NODEJS_22_X,
      handler: this.config.handler || "index.handler",
      code:
        this.config.code ||
        lambda.Code.fromInline("exports.handler = () => {}"),
    });

    if (this.enableUrl) {
      this.cdkAdapter.addFunctionUrl(scope, lambdaFn);
    }

    this.cdkAdapter.addLogGroup(scope, this.config.functionName, this.logGroup);

    if (!this.noAlarms) {
      this.cdkAdapter.addAlarm(scope, this.config.functionName, lambdaFn);
    }

    return lambdaFn;
  }
}
