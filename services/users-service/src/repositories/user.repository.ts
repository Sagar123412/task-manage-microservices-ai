import { randomUUID } from "node:crypto";
import type { CreateUserInput, UpdateUserInput } from "@task-manager/shared";
import { getLogger, HttpError } from "@task-manager/shared/server";
import type { User } from "../domain/user.entity.js";

const log = getLogger();

export class UserRepository {
  private readonly store = new Map<string, User>();
  private readonly byEmail = new Map<string, string>();

  async findAll(): Promise<User[]> {
    return [...this.store.values()];
  }

  async findById(id: string): Promise<User | null> {
    return this.store.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const id = this.byEmail.get(email.toLowerCase());
    if (!id) return null;
    return this.store.get(id) ?? null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const key = input.email.toLowerCase();
    if (this.byEmail.has(key)) {
      throw new HttpError("Email already registered", 409);
    }
    const now = new Date().toISOString();
    const user: User = {
      id: randomUUID(),
      email: input.email,
      name: input.name,
      role: input.role ?? "user",
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(user.id, user);
    this.byEmail.set(key, user.id);
    log.info("user_created", { userId: user.id });
    return user;
  }

  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    if (input.email && input.email.toLowerCase() !== existing.email.toLowerCase()) {
      const key = input.email.toLowerCase();
      const otherId = this.byEmail.get(key);
      if (otherId && otherId !== id) {
        throw new HttpError("Email already registered", 409);
      }
      this.byEmail.delete(existing.email.toLowerCase());
      this.byEmail.set(key, id);
    }
    const updated: User = {
      ...existing,
      ...("email" in input && input.email !== undefined ? { email: input.email } : {}),
      ...("name" in input && input.name !== undefined ? { name: input.name } : {}),
      ...("role" in input && input.role !== undefined ? { role: input.role } : {}),
      updatedAt: new Date().toISOString(),
    };
    this.store.set(id, updated);
    log.info("user_updated", { userId: id });
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const u = this.store.get(id);
    if (!u) return false;
    this.byEmail.delete(u.email.toLowerCase());
    const removed = this.store.delete(id);
    if (removed) log.info("user_deleted", { userId: id });
    return removed;
  }
}

let repository: UserRepository | null = null;

export function getUserRepository(): UserRepository {
  if (!repository) repository = new UserRepository();
  return repository;
}
