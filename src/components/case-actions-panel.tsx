"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  Check,
  Clock,
  X,
  Workflow,
  Mail,
  ListChecks,
  Calendar,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ActionStatus, ToolName } from "@/lib/types";

interface ActionRow {
  id: string;
  toolName: string | null;
  actionType: string;
  status: string;
  reason: string | null;
  payload: Record<string, unknown>;
  createdAt: Date;
}

const TOOL_ICONS: Record<ToolName, React.ElementType> = {
  createInternalTask: ListChecks,
  routeCase: Workflow,
  draftCustomerEmail: Mail,
  createCalendarFollowUp: Calendar,
  sendToHumanReview: ShieldAlert,
};

const TOOL_LABELS: Record<ToolName, string> = {
  createInternalTask: "createInternalTask",
  routeCase: "routeCase",
  draftCustomerEmail: "draftCustomerEmail",
  createCalendarFollowUp: "createCalendarFollowUp",
  sendToHumanReview: "sendToHumanReview",
};

export function CaseActionsPanel({
  caseId,
  actions,
}: {
  caseId: string;
  actions: ActionRow[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  if (actions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No tool calls yet — the agent hasn&apos;t recommended any actions.
      </p>
    );
  }

  const decide = async (actionId: string, decision: "approve" | "reject") => {
    const res = await fetch(`/api/cases/${caseId}/actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionId, decision }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error ?? "Action update failed.");
      return;
    }
    toast.success(
      decision === "approve" ? "Action approved." : "Action rejected.",
    );
    startTransition(() => router.refresh());
  };

  return (
    <ul className="space-y-3">
      {actions.map((a) => {
        const tool = (a.toolName ?? "") as ToolName;
        const Icon = TOOL_ICONS[tool] ?? Workflow;
        const label = TOOL_LABELS[tool] ?? a.actionType;
        return (
          <li
            key={a.id}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted/40">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
                      {label}
                    </code>
                    <StatusTag status={a.status as ActionStatus} />
                  </div>
                  {a.reason ? (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Why: </span>
                      {a.reason}
                    </p>
                  ) : null}
                  {Object.keys(a.payload).length > 0 ? (
                    <div className="mt-2 rounded-md border border-border bg-muted/30 p-2.5">
                      <pre className="text-[11px] leading-relaxed text-muted-foreground whitespace-pre-wrap break-words">
                        {JSON.stringify(a.payload, null, 2)}
                      </pre>
                    </div>
                  ) : null}
                </div>
              </div>
              {a.status === "PENDING" ? (
                <div className="flex shrink-0 flex-col gap-1.5">
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => decide(a.id, "approve")}
                  >
                    <Check className="h-3 w-3" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => decide(a.id, "reject")}
                  >
                    <X className="h-3 w-3" />
                    Reject
                  </Button>
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function StatusTag({ status }: { status: ActionStatus }) {
  const map = {
    PENDING: {
      icon: Clock,
      tone: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
    },
    COMPLETED: {
      icon: Check,
      tone: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
    },
    FAILED: {
      icon: X,
      tone: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20",
    },
  }[status];
  const Icon = map.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset",
        map.tone,
      )}
    >
      <Icon className="h-2.5 w-2.5" />
      {status.toLowerCase()}
    </span>
  );
}
