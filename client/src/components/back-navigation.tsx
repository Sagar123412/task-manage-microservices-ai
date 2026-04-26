"use client";

import { useRouter } from "next/navigation";

type BackNavigationProps = {
  fallbackHref?: string;
};

export function BackNavigation({
  fallbackHref = "/",
}: BackNavigationProps) {
  const router = useRouter();

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  };

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Go back"
      className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-600 shadow-sm transition-all hover:-translate-x-0.5 hover:shadow-md hover:ring-2 hover:ring-blue-200 dark:border-blue-900 dark:bg-zinc-900 dark:text-blue-300 dark:hover:ring-blue-900"
    >
      <span aria-hidden="true" className="text-lg leading-none transition-transform group-hover:-translate-x-0.5">
        ←
      </span>
    </button>
  );
}
