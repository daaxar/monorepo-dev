import { StackConfig } from "../Entities/StackConfig";

export interface IStackFactory {
  create(config: StackConfig): void;
}
