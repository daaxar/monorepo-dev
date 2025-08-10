import pino from "pino";
import LoggerMethods from "../domain/LoggerMethods";

const defaultFormatters = {
  level(label) {
    return { level: label };
  },
};

const basename = Math.random().toString(36).slice(2, 6);

export default class PinoLoggerFactory {
  static createLogger(
    name: string = process.env.SERVICE_NAME ||
      basename + Math.random().toString(36).slice(2, 6),
    level: string = process.env.LOG_LEVEL || "info",
    metadata: Record<string, unknown> = {},
    formatters: any = defaultFormatters,
  ): LoggerMethods {
    const core = pino({
      name,
      level,
      base: metadata,
      formatters,
    });

    return core as LoggerMethods;
  }
}
