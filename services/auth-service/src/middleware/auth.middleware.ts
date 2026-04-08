import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "@task-manager/shared/server";

export type AuthClaims = {
  sub: string;
  email: string;
  role: "admin" | "user";
};

export type AuthenticatedRequest = Request & {
  auth?: AuthClaims;
};

export function authenticate(jwtSecret: string) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      next(new HttpError("Missing bearer token", 401));
      return;
    }
    const token = authHeader.slice("Bearer ".length);
    try {
      const payload = jwt.verify(token, jwtSecret) as AuthClaims;
      req.auth = payload;
      next();
    } catch {
      next(new HttpError("Invalid or expired token", 401));
    }
  };
}

export function authorizeRoles(...allowedRoles: AuthClaims["role"][]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(new HttpError("Unauthorized", 401));
      return;
    }
    if (!allowedRoles.includes(req.auth.role)) {
      next(new HttpError("Forbidden", 403));
      return;
    }
    next();
  };
}
