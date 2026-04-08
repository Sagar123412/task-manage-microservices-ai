import express from "express";
import { createErrorMiddleware } from "@task-manager/shared/server";
import { userRoutes } from "./routes/user.routes.js";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/v1/users", userRoutes);
  app.use(
    createErrorMiddleware({
      serverErrorEvent: "unhandled_error",
      clientErrorEvent: "client_error",
    })
  );
  return app;
}
