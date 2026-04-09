import express from "express";
import { createErrorMiddleware } from "@task-manager/shared/server";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "notification-service" });
  });
  app.use(
    createErrorMiddleware({
      serverErrorEvent: "notification_unhandled_error",
      clientErrorEvent: "notification_client_error",
    })
  );
  return app;
}
