"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { TooltipSide } from "@/components/tooltip-side";

export function SignOutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const signOut = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("Sign-out failed.");
      startTransition(() => {
        router.replace("/login");
        router.refresh();
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-out failed.");
    }
  };

  return (
    <TooltipSide label="Sign out">
      <button
        type="button"
        onClick={signOut}
        disabled={pending}
        aria-label="Sign out"
        className="focus-ring pressable grid h-10 w-10 place-items-center rounded-full bg-[rgba(var(--text)/0.05)] text-[rgb(var(--text))] hover:bg-[rgba(var(--text)/0.08)] disabled:opacity-60"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </TooltipSide>
  );
}
