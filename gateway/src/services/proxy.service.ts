import type { Request } from "express";
import { getLogger, HttpError } from "@task-manager/shared/server";
import { getUpstreamRepository } from "../repositories/upstream.repository.js";

const log = getLogger();

export class ProxyService {
  constructor(private readonly upstream = getUpstreamRepository()) {}

  async forwardToService(serviceBaseUrl: string | undefined, req: Request): Promise<{
    status: number;
    body: unknown;
    contentType: string | null;
  }> {
    if (!serviceBaseUrl) {
      log.error("upstream_not_configured");
      throw new HttpError("Upstream not configured", 502);
    }
    const pathWithQuery = req.originalUrl;
    const hasJsonBody = req.is("application/json") === "application/json";
    const body = hasJsonBody ? req.body : undefined;
    const forwardedHeaders: Record<string, string> = {};
    if (typeof req.headers.authorization === "string") {
      forwardedHeaders.authorization = req.headers.authorization;
    }
    return this.upstream.forward(
      serviceBaseUrl,
      req.method,
      pathWithQuery,
      body,
      hasJsonBody,
      forwardedHeaders
    );
  }
}

let proxyService: ProxyService | null = null;

export function getProxyService(): ProxyService {
  if (!proxyService) proxyService = new ProxyService();
  return proxyService;
}
