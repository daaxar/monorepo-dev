export interface LoggerMethods {
  info: Console["info"];
  warn: Console["warn"];
  error: Console["error"];
  debug: Console["debug"];
  child?: (context?: Record<string, unknown>) => LoggerMethods;
}
