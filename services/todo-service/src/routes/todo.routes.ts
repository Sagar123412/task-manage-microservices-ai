import { Router } from "express";
import {
  createTodoSchema,
  listTodosQuerySchema,
  todoIdParamsSchema,
  updateTodoSchema,
} from "@task-manager/shared";
import { validateBody, validateParams, validateQuery } from "@task-manager/shared/server";
import { TodoController } from "../controllers/todo.controller.js";
import { getTodoService } from "../services/todo.service.js";

export function buildTodoRoutes(config: { redisUrl: string }) {
  const router = Router();
  const controller = new TodoController(getTodoService(config.redisUrl));

  router.post("/", validateBody(createTodoSchema), controller.create);
  router.get("/", validateQuery(listTodosQuerySchema), controller.list);
  router.get("/:id", validateParams(todoIdParamsSchema), controller.getById);
  router.patch(
    "/:id",
    validateParams(todoIdParamsSchema),
    validateBody(updateTodoSchema),
    controller.update
  );
  router.delete("/:id", validateParams(todoIdParamsSchema), controller.remove);

  return router;
}
