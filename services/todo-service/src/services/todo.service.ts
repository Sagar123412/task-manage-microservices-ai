import type { CreateTodoInput, ListTodosQuery, UpdateTodoInput } from "@task-manager/shared";
import { getLogger, HttpError } from "@task-manager/shared/server";
import type { PaginatedTodos, Todo } from "../domain/todo.entity.js";
import { getTodoRepository } from "../repositories/todo.repository.js";
import { getRedisClient } from "../lib/redis.js";

const log = getLogger();

export class TodoService {
  constructor(
    private readonly redisUrl: string,
    private readonly repo = getTodoRepository()
  ) {}

  private itemKey(id: string) {
    return `todo:item:${id}`;
  }

  private listKey(query: ListTodosQuery) {
    return `todo:list:${JSON.stringify(query)}`;
  }

  private async invalidateListCache(): Promise<void> {
    const redis = await getRedisClient(this.redisUrl);
    for await (const key of redis.scanIterator({ MATCH: "todo:list:*" })) {
      await redis.del(key);
    }
  }

  async createTodo(input: CreateTodoInput): Promise<Todo> {
    const created = await this.repo.create(input);
    const redis = await getRedisClient(this.redisUrl);
    await redis.set(this.itemKey(created.id), JSON.stringify(created), { EX: 120 });
    await this.invalidateListCache();
    return created;
  }

  async getTodo(id: string): Promise<Todo> {
    const redis = await getRedisClient(this.redisUrl);
    const cached = await redis.get(this.itemKey(id));
    if (cached) return JSON.parse(cached) as Todo;

    const todo = await this.repo.findById(id);
    if (!todo) throw new HttpError("Todo not found", 404);
    await redis.set(this.itemKey(id), JSON.stringify(todo), { EX: 120 });
    return todo;
  }

  async listTodos(query: ListTodosQuery): Promise<PaginatedTodos> {
    const redis = await getRedisClient(this.redisUrl);
    const key = this.listKey(query);
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached) as PaginatedTodos;

    const result = await this.repo.findAll(query);
    await redis.set(key, JSON.stringify(result), { EX: 60 });
    return result;
  }

  async updateTodo(id: string, input: UpdateTodoInput): Promise<Todo> {
    const updated = await this.repo.update(id, input);
    if (!updated) throw new HttpError("Todo not found", 404);
    const redis = await getRedisClient(this.redisUrl);
    await redis.set(this.itemKey(id), JSON.stringify(updated), { EX: 120 });
    await this.invalidateListCache();
    return updated;
  }

  async deleteTodo(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) throw new HttpError("Todo not found", 404);
    const redis = await getRedisClient(this.redisUrl);
    await redis.del(this.itemKey(id));
    await this.invalidateListCache();
    log.info("todo_deleted", { todoId: id });
  }
}

let todoService: TodoService | null = null;

export function getTodoService(redisUrl: string): TodoService {
  if (!todoService) {
    todoService = new TodoService(redisUrl);
  }
  return todoService;
}
