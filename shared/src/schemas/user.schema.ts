import { z } from "zod";

export const userRoleSchema = z.enum(["user", "admin"]);

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(200),
  role: userRoleSchema.optional().default("user"),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).max(200).optional(),
  role: userRoleSchema.optional(),
});

export const userIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
