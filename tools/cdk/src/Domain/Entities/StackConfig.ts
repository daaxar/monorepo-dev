export interface StackConfig {
  stackName: string;
  description?: string;
  tags?: Record<string, string>;
  stacks: LambdaConfig[];
  outputDir: string;
  package: { name: string; path: string };
}
