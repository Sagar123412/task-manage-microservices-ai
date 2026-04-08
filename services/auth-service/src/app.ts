import express from "express";
import type { SignOptions } from "jsonwebtoken";
import { createErrorMiddleware } from "@task-manager/shared/server";
import { buildAuthRoutes } from "./routes/auth.routes.js";

export type AuthAppConfig = {
  jwtAccessSecret: string;
  jwtAccessExpiresIn: SignOptions["expiresIn"];
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: SignOptions["expiresIn"];
  refreshTokenTtlDays: number;
};

export function createApp(config: AuthAppConfig) {
  const app = express();
  app.use(express.json());
  app.use("/api/v1/auth", buildAuthRoutes(config));
  app.use(
    createErrorMiddleware({
      serverErrorEvent: "auth_unhandled_error",
      clientErrorEvent: "auth_client_error",
    })
  );
  return app;
}
