"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BackNavigation } from "@/components/back-navigation";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/context/toast-context";

export function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [message, setMessage] = useState("Click verify to confirm this email.");
  const [isLoading, setIsLoading] = useState(false);

  const verifyEmail = async () => {
    if (!token) {
      const missingTokenMessage = "Verification token is missing.";
      setMessage(missingTokenMessage);
      showToast(missingTokenMessage, "error");
      return;
    }

    try {
      setIsLoading(true);
      const data = await apiRequest<{ message: string }>({
        path: `/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`,
        method: "POST",
      });
      const successMessage = data.message ?? "Email verified successfully.";
      setMessage(successMessage);
      showToast(successMessage, "success");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Verification failed.";
      setMessage(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-start justify-center gap-6 px-6 py-20">
      <div className="-mb-2">
        <BackNavigation fallbackHref="/auth?mode=login" />
      </div>
      <h1 className="text-3xl font-semibold">Verify Email</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{message}</p>
      <button
        type="button"
        onClick={verifyEmail}
        disabled={isLoading}
        className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "Verifying..." : "Verify Email"}
      </button>
    </main>
  );
}
