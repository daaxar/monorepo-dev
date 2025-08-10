import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as logs from "aws-cdk-lib/aws-logs";
import * as sns from "aws-cdk-lib/aws-sns";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as cloudwatch_actions from "aws-cdk-lib/aws-cloudwatch-actions";
import { CfnOutput, RemovalPolicy } from "aws-cdk-lib";
import { FileSystemAdapter } from "./FileSystemAdapter";

export class AwsCdkAdapter {
  private vpcCache: Record<
    string,
    {
      vpc: ec2.IVpc;
      securityGroups?: ec2.SecurityGroup[];
      vpcSubnets?: ec2.SubnetSelection;
    }
  > = {};
  private logGroupCache: Record<string, logs.ILogGroup> = {};
  private alarmTopic?: sns.Topic;

  constructor(private fsAdapter: FileSystemAdapter) {}

  async getVpc(
    scope: Construct,
    vpcId?: string,
    createVpc?: boolean,
  ): Promise<{
    vpc: ec2.IVpc;
    securityGroups?: ec2.SecurityGroup[];
    vpcSubnets?: ec2.SubnetSelection;
  }> {
    if (vpcId && this.vpcCache[vpcId]) return this.vpcCache[vpcId];

    let vpc: ec2.IVpc | undefined;
    if (vpcId) {
      vpc = ec2.Vpc.fromLookup(scope, "LambdaVPC", { vpcId });
    } else if (createVpc) {
      vpc = new ec2.Vpc(scope, "NewLambdaVPC", { maxAzs: 2, natGateways: 1 });
    }

    if (!vpc) throw new Error("VPC configuration failed");

    const securityGroup = new ec2.SecurityGroup(scope, "LambdaSecurityGroup", {
      vpc,
      description: "Security Group for Lambda",
      allowAllOutbound: true,
    });

    const vpcConfig = {
      vpc,
      securityGroups: [securityGroup],
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
    };

    if (vpcId) this.vpcCache[vpcId] = vpcConfig;
    return vpcConfig;
  }

  async createLayer(
    scope: Construct,
    layer: { name: string; deps: string[] },
  ): Promise<lambda.LayerVersion> {
    const zipPath = await this.fsAdapter.createLayerZip(layer.name, layer.deps);
    return new lambda.LayerVersion(scope, `${layer.name}Layer`, {
      code: lambda.Code.fromAsset(zipPath),
      compatibleRuntimes: [lambda.Runtime.NODEJS_22_X],
      layerVersionName: layer.name,
      removalPolicy: RemovalPolicy.DESTROY,
      description: `Layer for ${layer.name}`,
    });
  }

  addFunctionUrl(scope: Construct, fn: lambda.Function): void {
    const url = new lambda.FunctionUrl(scope, `${fn.functionName}FunctionUrl`, {
      function: fn,
      authType: lambda.FunctionUrlAuthType.NONE,
    });
    this.addOutput(scope, `${fn.functionName}FunctionUrl`, {
      value: url.url,
      description: "Lambda Function URL",
    });
  }

  addLogGroup(
    scope: Construct,
    functionName: string,
    logGroupName?: string,
  ): void {
    const name = logGroupName || `/aws/lambda/${functionName}`;
    if (!this.logGroupCache[name]) {
      this.logGroupCache[name] = logGroupName
        ? logs.LogGroup.fromLogGroupName(scope, `${functionName}LogGroup`, name)
        : new logs.LogGroup(scope, `${functionName}LogGroup`, {
            logGroupName: name,
            retention: logs.RetentionDays.TWO_WEEKS,
            removalPolicy: RemovalPolicy.RETAIN,
          });
    }

    this.addOutput(scope, `${functionName}LogGroup`, {
      value: this.logGroupCache[name].logGroupName,
      description: "Log Group",
    });
  }

  addAlarm(scope: Construct, functionName: string, fn: lambda.Function): void {
    if (!this.alarmTopic) {
      this.alarmTopic = new sns.Topic(scope, "LambdaErrorNotification", {
        displayName: `Alarms ${scope.node.id}`,
      });
    }
    new cloudwatch.Alarm(scope, `${functionName}ErrorAlarm`, {
      alarmName: `Lambda ${functionName}`,
      metric: fn.metricErrors(),
      threshold: 1,
      evaluationPeriods: 1,
      alarmDescription: `Alarm for function ${functionName}`,
    }).addAlarmAction(new cloudwatch_actions.SnsAction(this.alarmTopic));
  }

  addOutput(
    scope: Construct,
    id: string,
    props: { value: string; description: string },
  ): void {
    new CfnOutput(scope, `Output${id}`, props);
  }
}
