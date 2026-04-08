import type { CreateUserInput, UpdateUserInput } from "@task-manager/shared";
import { getLogger, HttpError } from "@task-manager/shared/server";
import type { User } from "../domain/user.entity.js";
import { getUserRepository } from "../repositories/user.repository.js";

const log = getLogger();

export class UserService {
  constructor(private readonly repo = getUserRepository()) {}

  async listUsers(): Promise<User[]> {
    return this.repo.findAll();
  }

  async getUser(id: string): Promise<User> {
    const user = await this.repo.findById(id);
    if (!user) {
      log.warn("user_not_found", { userId: id });
      throw new HttpError("User not found", 404);
    }
    return user;
  }

  async createUser(input: CreateUserInput): Promise<User> {
    return this.repo.create(input);
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    const updated = await this.repo.update(id, input);
    if (!updated) {
      throw new HttpError("User not found", 404);
    }
    return updated;
  }

  async removeUser(id: string): Promise<void> {
    const ok = await this.repo.delete(id);
    if (!ok) {
      throw new HttpError("User not found", 404);
    }
  }
}

let userService: UserService | null = null;

export function getUserService(): UserService {
  if (!userService) userService = new UserService();
  return userService;
}
