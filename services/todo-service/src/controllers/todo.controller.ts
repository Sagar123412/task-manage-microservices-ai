import type { NextFunction, Request, Response } from "express";
import type { TodoService } from "../services/todo.service.js";

export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const created = await this.todoService.createTodo(req.body);
      res.status(201).json(created);
    } catch (e) {
      next(e);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const todo = await this.todoService.getTodo(req.params.id as string);
      res.json(todo);
    } catch (e) {
      next(e);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const todos = await this.todoService.listTodos(req.query as never);
      res.json(todos);
    } catch (e) {
      next(e);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await this.todoService.updateTodo(req.params.id as string, req.body);
      res.json(updated);
    } catch (e) {
      next(e);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.todoService.deleteTodo(req.params.id as string);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  };
}
