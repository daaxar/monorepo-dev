import { StackProps } from "aws-cdk-lib";
import StackSettings from "../../Domain/StackSettings";

export function convertStackSettingsToProps(
  settings: StackSettings,
  account: string = process.env.AWS_ACCOUNT || "",
): StackProps | undefined {
  const { description, env, stackName, tags } = settings || {};

  if (!description && !env && !stackName && !tags && !account) return undefined;

  const accountEnv = account
    ? { env: { account, region: process.env.AWS_REGION } }
    : {};

  return {
    description,
    // env,
    stackName,
    ...accountEnv,
  };
}
