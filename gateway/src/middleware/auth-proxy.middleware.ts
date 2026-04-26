import type { NextFunction, Request, Response } from "express";
import { HttpError } from "@task-manager/shared/server";

type AuthGuardConfig = {
  authServiceUrl: string;
};

export function createAuthProxyMiddleware(config: AuthGuardConfig) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const authorization = req.headers.authorization;
      if (!authorization) {
        throw new HttpError("Authentication required", 401);
      }

      const normalizedAuthServiceUrl = config.authServiceUrl.replace(/\/$/, "");
      const verifyResponse = await fetch(`${normalizedAuthServiceUrl}/api/v1/auth/me`, {
        method: "GET",
        headers: {
          Authorization: authorization,
        },
      });

      if (!verifyResponse.ok) {
        throw new HttpError("Invalid or expired token", 401);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
