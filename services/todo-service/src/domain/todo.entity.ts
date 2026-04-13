import type { TodoStatus } from "@task-manager/shared";

export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTodos {
  items: Todo[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
