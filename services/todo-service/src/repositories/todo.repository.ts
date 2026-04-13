import mongoose, { Schema, type FilterQuery } from "mongoose";
import type { CreateTodoInput, ListTodosQuery, UpdateTodoInput } from "@task-manager/shared";
import type { PaginatedTodos, Todo } from "../domain/todo.entity.js";

interface TodoDocument {
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const todoSchema = new Schema<TodoDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    status: { type: String, enum: ["todo", "in_progress", "done"], default: "todo" },
    dueDate: { type: Date, required: false },
  },
  { timestamps: true }
);

const TodoModel =
  (mongoose.models.Todo as mongoose.Model<TodoDocument>) ||
  mongoose.model<TodoDocument>("Todo", todoSchema);

function mapTodo(doc: TodoDocument & { _id: mongoose.Types.ObjectId }): Todo {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    status: doc.status,
    dueDate: doc.dueDate?.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export class TodoRepository {
  async create(input: CreateTodoInput): Promise<Todo> {
    const created = await TodoModel.create({
      ...input,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    });
    return mapTodo(created as unknown as TodoDocument & { _id: mongoose.Types.ObjectId });
  }

  async findById(id: string): Promise<Todo | null> {
    const found = await TodoModel.findById(id).exec();
    if (!found) return null;
    return mapTodo(found as unknown as TodoDocument & { _id: mongoose.Types.ObjectId });
  }

  async findAll(query: ListTodosQuery): Promise<PaginatedTodos> {
    const filter: FilterQuery<TodoDocument> = {};
    if (query.status) filter.status = query.status;
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: "i" } },
        { description: { $regex: query.search, $options: "i" } },
      ];
    }
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      TodoModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit).exec(),
      TodoModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items.map((d) => mapTodo(d as unknown as TodoDocument & { _id: mongoose.Types.ObjectId })),
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    };
  }

  async update(id: string, input: UpdateTodoInput): Promise<Todo | null> {
    const updated = await TodoModel.findByIdAndUpdate(
      id,
      {
        ...input,
        ...(input.dueDate ? { dueDate: new Date(input.dueDate) } : {}),
      },
      { new: true }
    ).exec();
    if (!updated) return null;
    return mapTodo(updated as unknown as TodoDocument & { _id: mongoose.Types.ObjectId });
  }

  async delete(id: string): Promise<boolean> {
    const result = await TodoModel.findByIdAndDelete(id).exec();
    return Boolean(result);
  }
}

let todoRepository: TodoRepository | null = null;

export function getTodoRepository(): TodoRepository {
  if (!todoRepository) todoRepository = new TodoRepository();
  return todoRepository;
}
