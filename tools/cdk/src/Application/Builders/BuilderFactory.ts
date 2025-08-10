import { AwsCdkAdapter } from "../../Infrastructure/AwsCdkAdapter";
import { LambdaBuilder } from "./LambdaBuilder";
import { ILambdaBuilder } from "../../Domain/Ports/ILambdaBuilder";

export class BuilderFactory {
  constructor(private cdkAdapter: AwsCdkAdapter) {}

  createLambdaBuilder(): ILambdaBuilder {
    return new LambdaBuilder(this.cdkAdapter);
  }
}
