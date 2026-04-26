import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-start justify-center gap-4 px-6">
      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">404</p>
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link
        href="/"
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
      >
        Go to home
      </Link>
    </main>
  );
}
