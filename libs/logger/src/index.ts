import { hostname as getHostname } from "node:os";
import Logger from "./application/logger";
import LoggerMethods from "./domain/LoggerMethods";
import PinoLoggerFactory from "./infrastructure/PinoLoggerFactory";

let _defaultInstance;
let getDefaultInstance = (): Logger => {
  if (!_defaultInstance) {
    let name: string =
      process.env.LOG_NAME || Math.random().toString(36).slice(2, 8);
    let hostname: string =
      process.env.HOST ||
      process.env.LOG_SOURCE ||
      getHostname() ||
      Math.random().toString(36).slice(2, 8);

    const core = PinoLoggerFactory.createLogger(
      name,
      process.env.LOG_LEVEL || "info",
      {
        hostname,
      },
    );
    _defaultInstance = new Logger(core);
  }

  return _defaultInstance;
};

export default getDefaultInstance();
export { getDefaultInstance, Logger, LoggerMethods };
