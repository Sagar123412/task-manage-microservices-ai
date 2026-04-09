import { z } from "zod";
import { userRoleSchema } from "./user.schema.js";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: userRoleSchema.optional().default("user"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(32),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(32),
});

export const verifyEmailQuerySchema = z.object({
  token: z.string().min(32).max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
export type VerifyEmailQueryInput = z.infer<typeof verifyEmailQuerySchema>;
