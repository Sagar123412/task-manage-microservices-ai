import type { Request, Response, NextFunction } from "express";
import type { ProxyService } from "../services/proxy.service.js";

export function createProxyHandler(serviceBaseUrl: string | undefined, proxyService: ProxyService) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await proxyService.forwardToService(serviceBaseUrl, req);
      if (result.contentType?.includes("application/json")) {
        res.status(result.status).json(result.body);
        return;
      }
      if (result.body === null || result.body === undefined) {
        res.status(result.status).send();
        return;
      }
      res.status(result.status).send(result.body);
    } catch (e) {
      next(e);
    }
  };
}
