"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Check, Play, ShieldAlert, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { CaseStatus } from "@/lib/types";

type Variant = "primary" | "outline" | "ghost";

const TRANSITIONS: {
  to: CaseStatus;
  label: string;
  icon: React.ElementType;
  variant: Variant;
  allowedFrom: CaseStatus[];
}[] = [
  {
    to: "ANALYZED",
    label: "Approve AI analysis",
    icon: Check,
    variant: "primary",
    allowedFrom: ["NEEDS_REVIEW"],
  },
  {
    to: "IN_PROGRESS",
    label: "Mark in progress",
    icon: Play,
    variant: "primary",
    allowedFrom: ["ANALYZED", "NEEDS_REVIEW"],
  },
  {
    to: "NEEDS_REVIEW",
    label: "Send to human review",
    icon: ShieldAlert,
    variant: "outline",
    allowedFrom: ["NEW", "ANALYZED", "IN_PROGRESS"],
  },
  {
    to: "COMPLETED",
    label: "Mark completed",
    icon: CheckCheck,
    variant: "outline",
    allowedFrom: ["ANALYZED", "IN_PROGRESS", "NEEDS_REVIEW"],
  },
];

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent2))] text-white shadow-[0_8px_24px_-8px_rgba(168,162,255,0.55)]",
  outline:
    "border border-[rgba(var(--text)/0.12)] bg-[rgba(var(--text)/0.04)] text-[rgb(var(--text))] hover:bg-[rgba(var(--text)/0.08)]",
  ghost:
    "text-[rgba(var(--text)/0.7)] hover:bg-[rgba(var(--text)/0.06)] hover:text-[rgb(var(--text))]",
};

export function CaseStatusButtons({
  caseId,
  currentStatus,
}: {
  caseId: string;
  currentStatus: CaseStatus;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const move = async (to: CaseStatus) => {
    const res = await fetch(`/api/cases/${caseId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: to }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error ?? "Status update failed.");
      return;
    }
    toast.success(`Status moved to ${to.replace(/_/g, " ").toLowerCase()}.`);
    startTransition(() => router.refresh());
  };

  const available = TRANSITIONS.filter(
    (t) => t.allowedFrom.includes(currentStatus) && t.to !== currentStatus,
  );

  if (available.length === 0) {
    return (
      <p className="text-caption text-[rgba(var(--text)/0.55)]">
        Case is {currentStatus.toLowerCase()} — no further transitions.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {available.map((t) => {
        const Icon = t.icon;
        return (
          <button
            key={t.to}
            type="button"
            onClick={() => move(t.to)}
            className={cn(
              "focus-ring pressable inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-caption font-semibold",
              VARIANT_CLASS[t.variant],
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
