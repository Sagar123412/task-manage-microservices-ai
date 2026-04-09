import { Router } from "express";
import type { SignOptions } from "jsonwebtoken";
import { loginSchema, logoutSchema, refreshTokenSchema, registerSchema } from "@task-manager/shared";
import { validateBody } from "@task-manager/shared/server";
import { AuthController } from "../controllers/auth.controller.js";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";
import { getAuthService } from "../services/auth.service.js";

export function buildAuthRoutes(config: {
  jwtAccessSecret: string;
  jwtAccessExpiresIn: SignOptions["expiresIn"];
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: SignOptions["expiresIn"];
  refreshTokenTtlDays: number;
  verifyEmailBaseUrl: string;
  rabbitmqUrl: string;
  eventExchangeName: string;
}) {
  const router = Router();
  const authService = getAuthService(config);
  const authController = new AuthController(authService);

  router.post("/register", validateBody(registerSchema), authController.register);
  router.post("/login", validateBody(loginSchema), authController.login);
  router.post("/refresh", validateBody(refreshTokenSchema), authController.refresh);
  router.post("/logout", validateBody(logoutSchema), authController.logout);
  router.get("/verify-email", authController.verifyEmail);
  router.get("/me", authenticate(config.jwtAccessSecret), authController.me);
  router.get(
    "/admin-only",
    authenticate(config.jwtAccessSecret),
    authorizeRoles("admin"),
    authController.adminOnly
  );

  return router;
}
