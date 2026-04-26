"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BackNavigation } from "@/components/back-navigation";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";

const defaultPayload = { email: "", password: "" };

export function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login, register, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const mode = useMemo(() => {
    const value = searchParams.get("mode");
    return value === "signup" ? "signup" : "login";
  }, [searchParams]);
  const redirectPath = searchParams.get("redirect") ?? "/dashboard";

  const [payload, setPayload] = useState(defaultPayload);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setIsLoading(true);
      if (mode === "signup") {
        const registerMessage = await register(payload);
        showToast(registerMessage, "success");
        return;
      }

      await login(payload);
      showToast("Login successful.", "success");
      router.replace(redirectPath);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Authentication failed.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-20">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4">
          <BackNavigation fallbackHref="/" />
        </div>
        <h1 className="text-2xl font-semibold">
          {mode === "signup" ? "Create account" : "Login"}
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          {mode === "signup"
            ? "Create your account first, then log in to open your dashboard."
            : "Use your existing account to continue."}
        </p>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={payload.email}
            onChange={(event) => setPayload((prev) => ({ ...prev, email: event.target.value }))}
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={payload.password}
            onChange={(event) =>
              setPayload((prev) => ({ ...prev, password: event.target.value }))
            }
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-70"
          >
            {isLoading ? "Please wait..." : mode === "signup" ? "Sign up" : "Login"}
          </button>
        </form>

        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
          {mode === "signup" ? "Already have an account?" : "New user?"}{" "}
          <Link
            href={mode === "signup" ? "/auth?mode=login" : "/auth?mode=signup"}
            className="font-medium text-blue-600 dark:text-blue-400"
          >
            {mode === "signup" ? "Login here" : "Create account"}
          </Link>
        </p>
      </div>
    </main>
  );
}
