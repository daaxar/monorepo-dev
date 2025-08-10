import LoggerMethods from "../domain/LoggerMethods";
import ExtendedLoggerMethods from "../domain/ExtendedLoggerMethods";

export type ExtendedLoggerType = LoggerMethods & ExtendedLoggerMethods;

export default class Logger implements ExtendedLoggerType {
  constructor(private readonly logger: LoggerMethods) {}
  info(message: string, context?: Record<string, any>): void {
    this.logger.info(message, context || {});
  }
  debug(message: string, context?: Record<string, any>): void {
    this.logger.debug(message, context || {});
  }
  warn(message: string, context?: Record<string, any>): void {
    this.logger.warn(message, context || {});
  }
  error(message: string, context?: Record<string, any>): void {
    this.logger.error(message, context || {});
  }
  child(context?: Record<string, unknown>): Logger {
    if (this.logger.child) {
      return new Logger(this.logger.child(context));
    }
    return this;
  }
  log(
    level: "info" | "debug" | "warn" | "error",
    message: string,
    context?: Record<string, any>,
  ): void;
  log(object: any, context?: Record<string, any>): void;
  log(error: Error, context?: Record<string, any>): void;
  log(level: unknown, message?: unknown, context?: Record<string, any>): void {
    if (
      message &&
      typeof message === "string" &&
      typeof level === "string" &&
      ["info", "debug", "warn", "error"].includes(level)
    ) {
      this[level](message as string, context as Record<string, any>);
    } else if (level instanceof Error && typeof message === "object") {
      this.error(level.message, {
        ...message,
        ...context,
        stack: level.stack,
      });
    } else if (level instanceof Error) {
      this.error(level.message, { stack: level.stack });
    } else if (message && typeof message === "object") {
      this.info(JSON.stringify(level), { ...message, ...context });
    } else {
      this.info(JSON.stringify(level));
    }
  }
}
