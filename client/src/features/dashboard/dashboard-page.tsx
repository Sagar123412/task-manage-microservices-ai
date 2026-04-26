"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { API_BASE_URL, apiRequest } from "@/lib/api";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";

type User = {
  id: string;
  email: string;
  role?: "admin" | "user";
};

type Todo = {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "completed";
};

const defaultTodoPayload = { title: "", description: "" };

export function DashboardPage() {
  const { user, token, logout } = useAuth();
  const { showToast } = useToast();
  const [todoPayload, setTodoPayload] = useState(defaultTodoPayload);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState("Ready");
  const [isLoading, setIsLoading] = useState(false);

  const runAction = async (action: () => Promise<void>) => {
    try {
      setIsLoading(true);
      await action();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unexpected error";
      setMessage(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    await runAction(async () => {
      const data = await apiRequest<{ data: User[] }>({
        path: "/api/v1/users",
        method: "GET",
        token,
      });
      setUsers(data.data ?? []);
      const successMessage = `Loaded ${data.data?.length ?? 0} users`;
      setMessage(successMessage);
      showToast(successMessage, "success");
    });
  };

  const fetchTodos = async () => {
    await runAction(async () => {
      const data = await apiRequest<{ data: Todo[] }>({
        path: "/api/v1/todos?limit=10&page=1",
        method: "GET",
        token,
      });
      setTodos(data.data ?? []);
      const successMessage = `Loaded ${data.data?.length ?? 0} todos`;
      setMessage(successMessage);
      showToast(successMessage, "success");
    });
  };

  const createTodo = async (event: FormEvent) => {
    event.preventDefault();
    await runAction(async () => {
      const data = await apiRequest<{ message?: string }>({
        path: "/api/v1/todos",
        method: "POST",
        body: { ...todoPayload, status: "pending" },
        token,
      });
      setTodoPayload(defaultTodoPayload);
      const successMessage = data.message ?? "Todo created.";
      setMessage(successMessage);
      showToast(successMessage, "success");
      await fetchTodos();
    });
  };

  return (
    <ProtectedRoute>
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">Dashboard</h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                Logged in as <span className="font-medium">{user?.email ?? "Unknown"}</span>
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                API base URL: <span className="font-medium">{API_BASE_URL}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/"
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
              >
                Home
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  showToast("Logged out successfully.", "info");
                }}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                Logout
              </button>
            </div>
          </div>
          <p className="mt-3 text-sm">
            Status:{" "}
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {isLoading ? "Loading..." : message}
            </span>
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold">Create Todo</h2>
            <form onSubmit={createTodo} className="mt-4 space-y-3">
              <input
                type="text"
                required
                placeholder="Todo title"
                value={todoPayload.title}
                onChange={(event) =>
                  setTodoPayload((prev) => ({ ...prev, title: event.target.value }))
                }
                className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
              />
              <textarea
                placeholder="Description"
                value={todoPayload.description}
                onChange={(event) =>
                  setTodoPayload((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                className="h-24 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-70"
              >
                Create Todo
              </button>
            </form>
          </article>

          <article className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Todos</h2>
              <button
                type="button"
                onClick={fetchTodos}
                disabled={isLoading}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700"
              >
                Refresh
              </button>
            </div>
            <ul className="space-y-2">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="rounded-md border border-zinc-200 p-2 text-sm dark:border-zinc-800"
                >
                  <p className="font-medium">{todo.title}</p>
                  <p className="text-xs text-zinc-500">{todo.description ?? "-"}</p>
                  <p className="text-xs text-zinc-500">Status: {todo.status}</p>
                </li>
              ))}
              {todos.length === 0 ? <li className="text-sm text-zinc-500">No todos yet.</li> : null}
            </ul>
          </article>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Users</h2>
            <button
              type="button"
              onClick={fetchUsers}
              disabled={isLoading}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700"
            >
              Load Users
            </button>
          </div>
          <ul className="space-y-2">
            {users.map((currentUser) => (
              <li
                key={currentUser.id}
                className="rounded-md border border-zinc-200 p-2 text-sm dark:border-zinc-800"
              >
                <p className="font-medium">{currentUser.email}</p>
                <p className="text-xs text-zinc-500">Role: {currentUser.role ?? "user"}</p>
              </li>
            ))}
            {users.length === 0 ? <li className="text-sm text-zinc-500">No users loaded.</li> : null}
          </ul>
        </section>
      </main>
    </ProtectedRoute>
  );
}
