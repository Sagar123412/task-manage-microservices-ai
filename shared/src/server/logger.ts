import winston from "winston";

let instance: winston.Logger | null = null;

export type LoggerConfig = {
  /** Shown in every log line as `service` (e.g. `users-service`). */
  serviceName: string;
  /** Overrides `LOG_LEVEL` env when set. */
  level?: string;
};

/**
 * Creates the process-wide Winston logger once. Call from each service entrypoint
 * before other modules call {@link getLogger}.
 */
export function configureLogger(config: LoggerConfig): winston.Logger {
  if (instance) {
    return instance;
  }
  const level = config.level ?? process.env.LOG_LEVEL ?? "info";
  instance = winston.createLogger({
    level,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: config.serviceName },
    transports: [new winston.transports.Console()],
  });
  return instance;
}

/** Returns the singleton logger; configures a fallback name if {@link configureLogger} was not called. */
export function getLogger(): winston.Logger {
  if (!instance) {
    configureLogger({
      serviceName: process.env.SERVICE_NAME ?? "app",
    });
  }
  return instance!;
}
