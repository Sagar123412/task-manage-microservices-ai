import express from "express";
import { createErrorMiddleware } from "@task-manager/shared/server";
import { buildTodoRoutes } from "./routes/todo.routes.js";

export function createApp(config: { redisUrl: string }) {
  const app = express();
  app.use(express.json());
  app.use("/api/v1/todos", buildTodoRoutes(config));
  app.use(
    createErrorMiddleware({
      serverErrorEvent: "todo_unhandled_error",
      clientErrorEvent: "todo_client_error",
    })
  );
  return app;
}
