import express from "express";
import { createErrorMiddleware } from "@task-manager/shared/server";
import { createProxyHandler } from "./controllers/proxy.controller.js";
import { getProxyService } from "./services/proxy.service.js";

export type GatewayAppConfig = {
  usersServiceUrl: string;
  authServiceUrl: string;
};

export function createApp(config: GatewayAppConfig) {
  const app = express();
  app.use(express.json());
  const proxyService = getProxyService();

  app.use("/api/v1/users", createProxyHandler(config.usersServiceUrl, proxyService));
  app.use("/api/v1/auth", createProxyHandler(config.authServiceUrl, proxyService));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use(
    createErrorMiddleware({
      serverErrorEvent: "gateway_error",
      clientErrorEvent: "gateway_client_error",
    })
  );
  return app;
}
