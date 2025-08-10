export interface LambdaConfig {
  functionName: string;
  handler: string;
  codePath: string;
  runtime: string;
  memorySize: number;
  timeoutSeconds: number;
  environment: Record<string, string>;
  vpcId?: string;
  createVpc?: boolean;
  layers?: { name: string; deps: string[] }[];
  enableUrl?: boolean;
  logGroup?: string;
  withoutAlarms?: boolean;
}
