/** Typed HTTP error for services; error middleware maps it to status + JSON body. */
export class HttpError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number, options?: { cause?: unknown }) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = "HttpError";
    this.statusCode = statusCode;
  }
}

export function getHttpStatus(err: unknown): number {
  if (err instanceof HttpError) {
    return err.statusCode;
  }
  if (typeof err === "object" && err !== null && "statusCode" in err) {
    const sc = (err as { statusCode?: unknown }).statusCode;
    if (typeof sc === "number" && sc >= 400 && sc < 600) {
      return sc;
    }
  }
  return 500;
}
