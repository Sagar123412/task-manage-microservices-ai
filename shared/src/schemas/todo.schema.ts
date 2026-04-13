import { z } from "zod";

export const todoStatusSchema = z.enum(["todo", "in_progress", "done"]);

export const createTodoSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: todoStatusSchema.optional().default("todo"),
  dueDate: z.string().datetime().optional(),
});

export const updateTodoSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: todoStatusSchema.optional(),
  dueDate: z.string().datetime().optional(),
});

export const todoIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const listTodosQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: todoStatusSchema.optional(),
  search: z.string().min(1).max(200).optional(),
});

export type TodoStatus = z.infer<typeof todoStatusSchema>;
export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type ListTodosQuery = z.infer<typeof listTodosQuerySchema>;
