"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Check, Play, ShieldAlert, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { CaseStatus } from "@/lib/types";

const TRANSITIONS: {
  to: CaseStatus;
  label: string;
  icon: React.ElementType;
  variant?: "default" | "outline" | "secondary";
  description: string;
  allowedFrom: CaseStatus[];
}[] = [
  {
    to: "ANALYZED",
    label: "Approve AI analysis",
    icon: Check,
    allowedFrom: ["NEEDS_REVIEW"],
    description: "Take this off the review queue.",
  },
  {
    to: "IN_PROGRESS",
    label: "Mark in progress",
    icon: Play,
    allowedFrom: ["ANALYZED", "NEEDS_REVIEW"],
    description: "Pick this case up.",
  },
  {
    to: "NEEDS_REVIEW",
    label: "Send to human review",
    icon: ShieldAlert,
    variant: "outline",
    allowedFrom: ["NEW", "ANALYZED", "IN_PROGRESS"],
    description: "Escalate to a human.",
  },
  {
    to: "COMPLETED",
    label: "Mark completed",
    icon: CheckCheck,
    variant: "secondary",
    allowedFrom: ["ANALYZED", "IN_PROGRESS", "NEEDS_REVIEW"],
    description: "Close out the case.",
  },
];

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
      <p className="text-xs text-muted-foreground">
        Case is {currentStatus.toLowerCase()} — no further transitions.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {available.map((t) => {
        const Icon = t.icon;
        return (
          <Button
            key={t.to}
            size="sm"
            variant={t.variant ?? "default"}
            onClick={() => move(t.to)}
          >
            <Icon className="h-3.5 w-3.5" />
            {t.label}
          </Button>
        );
      })}
    </div>
  );
}
