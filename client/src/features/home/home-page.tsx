import Link from "next/link";

export function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center gap-8 px-6 py-20">
      <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
          Task Manager Microservices
        </p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
          Manage your tasks with secure auth flow
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-zinc-600 dark:text-zinc-300">
          New users sign up, existing users log in, and only authenticated users can access
          dashboard features like creating and listing todos.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/auth?mode=signup"
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white"
          >
            Create account
          </Link>
          <Link
            href="/auth?mode=login"
            className="rounded-md border border-zinc-300 px-5 py-2 text-sm font-medium dark:border-zinc-700"
          >
            Login
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md border border-zinc-300 px-5 py-2 text-sm font-medium dark:border-zinc-700"
          >
            Open dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
