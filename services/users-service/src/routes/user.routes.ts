import { Router } from "express";
import {
  createUserSchema,
  updateUserSchema,
  userIdParamsSchema,
} from "@task-manager/shared";
import { validateBody, validateParams } from "@task-manager/shared/server";
import * as userController from "../controllers/user.controller.js";

const router = Router();

router.get("/", userController.listUsers);
router.get("/:id", validateParams(userIdParamsSchema), userController.getUser);
router.post("/", validateBody(createUserSchema), userController.createUser);
router.patch(
  "/:id",
  validateParams(userIdParamsSchema),
  validateBody(updateUserSchema),
  userController.updateUser
);
router.delete("/:id", validateParams(userIdParamsSchema), userController.deleteUser);

export { router as userRoutes };
