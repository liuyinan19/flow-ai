"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[route error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-start gap-4 px-5 py-12 sm:px-8">
      <span className="inline-grid h-10 w-10 place-items-center rounded-2xl bg-[rgba(var(--red)/0.12)] text-[rgb(var(--red))]">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <div>
        <h1 className="text-heading-2 font-semibold tracking-tight">
          Something went wrong.
        </h1>
        <p className="mt-2 text-body-sm text-[rgba(var(--text)/0.7)]">
          {error.message || "An unexpected error occurred while rendering this page."}
        </p>
        {error.digest ? (
          <p className="mt-1 text-caption text-[rgba(var(--text)/0.5)]">
            Error ID: <code className="rounded bg-[rgba(var(--text)/0.06)] px-1.5 py-0.5">{error.digest}</code>
          </p>
        ) : null}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="focus-ring pressable inline-flex h-10 items-center gap-1.5 rounded-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent2))] px-5 text-sm font-semibold text-white"
        >
          <RotateCcw className="h-4 w-4" />
          Try again
        </button>
        <Link
          href="/dashboard"
          className="focus-ring pressable inline-flex h-10 items-center rounded-full border border-[rgba(var(--text)/0.12)] bg-[rgba(var(--text)/0.04)] px-5 text-sm font-semibold"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
