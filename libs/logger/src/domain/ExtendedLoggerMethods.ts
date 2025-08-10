export interface ExtendedLoggerMethods {
  log(
    level: "info" | "debug" | "warn" | "error",
    message: string,
    context?: Record<string, any>,
  ): void;
  log(object: any, context?: Record<string, any>): void;
  log(error: Error, context?: Record<string, any>): void;
}
