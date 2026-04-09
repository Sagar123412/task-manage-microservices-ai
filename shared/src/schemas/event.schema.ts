import { z } from "zod";

export const userRegisteredEventSchema = z.object({
  type: z.literal("user.registered"),
  payload: z.object({
    userId: z.string().uuid(),
    email: z.string().email(),
    verificationUrl: z.string().url(),
  }),
});

export const todoCreatedEventSchema = z.object({
  type: z.literal("todo.created"),
  payload: z.object({
    todoId: z.string(),
    email: z.string().email(),
    title: z.string().min(1),
    dueDate: z.string().optional(),
  }),
});

export const notificationEventSchema = z.union([
  userRegisteredEventSchema,
  todoCreatedEventSchema,
]);

export type UserRegisteredEvent = z.infer<typeof userRegisteredEventSchema>;
export type TodoCreatedEvent = z.infer<typeof todoCreatedEventSchema>;
export type NotificationEvent = z.infer<typeof notificationEventSchema>;
