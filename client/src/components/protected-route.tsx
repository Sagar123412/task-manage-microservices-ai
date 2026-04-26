"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isBootstrapping } = useAuth();

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }

    if (!isAuthenticated) {
      const redirect = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/auth?mode=login&redirect=${redirect}`);
    }
  }, [isAuthenticated, isBootstrapping, pathname, router]);

  if (isBootstrapping || !isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Checking your session...</p>
      </main>
    );
  }

  return <>{children}</>;
}
