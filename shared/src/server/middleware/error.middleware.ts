import type { ErrorRequestHandler } from "express";
import { getHttpStatus } from "../errors/http-error.js";
import { getLogger } from "../logger.js";

export type ErrorMiddlewareOptions = {
  /** Log key for 5xx (default `server_error`). */
  serverErrorEvent?: string;
  /** Log key for 4xx (default `client_error`). */
  clientErrorEvent?: string;
};

/**
 * Express error handler: logs with Winston, responds with JSON `{ error: string }`.
 * Handles {@link HttpError} and legacy `Error & { statusCode?: number }`.
 */
export function createErrorMiddleware(options?: ErrorMiddlewareOptions): ErrorRequestHandler {
  const serverEvent = options?.serverErrorEvent ?? "server_error";
  const clientEvent = options?.clientErrorEvent ?? "client_error";

  return (err: unknown, _req, res, _next): void => {
    const log = getLogger();
    const status = getHttpStatus(err);
    const message = err instanceof Error ? err.message : "Internal Server Error";

    if (status >= 500) {
      log.error(serverEvent, {
        message,
        stack: err instanceof Error ? err.stack : undefined,
      });
    } else {
      log.warn(clientEvent, { message, status });
    }

    const body = status === 500 ? "Internal Server Error" : message;
    res.status(status).json({ error: body });
  };
}
