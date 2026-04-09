import type { NextFunction, Request, Response } from "express";
import { verifyEmailQuerySchema } from "@task-manager/shared";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import type { AuthService } from "../services/auth.service.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.refresh(req.body);
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.authService.logout(req.body);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  };

  me = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({ user: req.auth });
    } catch (e) {
      next(e);
    }
  };

  adminOnly = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({
        message: "Admin access granted",
        user: req.auth,
      });
    } catch (e) {
      next(e);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = verifyEmailQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(400).json({
          error: "Validation failed",
          details: parsed.error.flatten(),
        });
        return;
      }
      await this.authService.verifyEmail(parsed.data.token);
      res.status(200).json({ message: "Email verified successfully" });
    } catch (e) {
      next(e);
    }
  };
}
