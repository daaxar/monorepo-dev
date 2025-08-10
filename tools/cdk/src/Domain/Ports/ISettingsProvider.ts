import { StackConfig } from "../Entities/StackConfig";

export interface ISettingsProvider {
  getConfig(): StackConfig;
}
