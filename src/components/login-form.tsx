"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const INPUT_CLASS =
  "h-10 rounded-xl border-[rgba(var(--text)/0.1)] bg-[rgba(var(--text)/0.04)] focus-ring";

export function LoginForm({
  initialUser,
  initialPass,
}: {
  initialUser: string;
  initialPass: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [user, setUser] = useState(initialUser);
  const [pass, setPass] = useState(initialPass);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, pass }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error ?? `Sign-in failed (${res.status}).`);
      }
      // Force a full reload so the middleware re-evaluates with the new cookie.
      router.replace(next);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="user" className="text-caption font-medium text-[rgba(var(--text)/0.7)]">
          Username
        </Label>
        <Input
          id="user"
          autoComplete="username"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          required
          className={INPUT_CLASS}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pass" className="text-caption font-medium text-[rgba(var(--text)/0.7)]">
          Password
        </Label>
        <Input
          id="pass"
          type="password"
          autoComplete="current-password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          required
          className={INPUT_CLASS}
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className={cn(
          "focus-ring pressable inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition-shadow",
          "bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent2))] text-white",
          "shadow-[0_8px_24px_-8px_rgba(168,162,255,0.55)] hover:shadow-[0_12px_32px_-8px_rgba(168,162,255,0.75)]",
          submitting && "cursor-not-allowed opacity-70",
        )}
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="h-4 w-4" />
        )}
        Sign in
      </button>
    </form>
  );
}
