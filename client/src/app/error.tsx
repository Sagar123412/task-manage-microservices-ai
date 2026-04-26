"use client";

import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Unhandled route error:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-start justify-center gap-4 px-6">
      <p className="text-sm font-medium text-red-600 dark:text-red-400">Something went wrong</p>
      <h1 className="text-3xl font-semibold">We could not load this page</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        Please try again. If the issue continues, refresh the app after a moment.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
      >
        Try again
      </button>
    </main>
  );
}
