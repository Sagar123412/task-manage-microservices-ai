import type { Request, Response, NextFunction } from "express";
import { getUserService } from "../services/user.service.js";

const userService = getUserService();

export async function listUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await userService.listUsers();
    res.json(users);
  } catch (e) {
    next(e);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.getUser(req.params.id as string);
    res.json(user);
  } catch (e) {
    next(e);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (e) {
    next(e);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.updateUser(req.params.id as string, req.body);
    res.json(user);
  } catch (e) {
    next(e);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await userService.removeUser(req.params.id as string);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
