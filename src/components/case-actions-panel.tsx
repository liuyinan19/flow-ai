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
      <p className="text-body-sm text-[rgba(var(--text)/0.6)]">
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
    toast.success(decision === "approve" ? "Action approved." : "Action rejected.");
    startTransition(() => router.refresh());
  };

  return (
    <ul className="space-y-3">
      {actions.map((a) => {
        const tool = (a.toolName ?? "") as ToolName;
        const Icon = TOOL_ICONS[tool] ?? Workflow;
        return (
          <li key={a.id} className="card-glass grain p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="inline-grid h-9 w-9 place-items-center rounded-xl bg-[rgba(var(--accent)/0.12)] text-[rgb(var(--accent))]">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="rounded-md bg-[rgba(var(--text)/0.06)] px-1.5 py-0.5 text-caption font-medium">
                      {a.toolName ?? a.actionType}
                    </code>
                    <StatusTag status={a.status as ActionStatus} />
                  </div>
                  {a.reason ? (
                    <p className="mt-2 text-caption text-[rgba(var(--text)/0.7)]">
                      <span className="font-semibold text-[rgb(var(--text))]">
                        Why:{" "}
                      </span>
                      {a.reason}
                    </p>
                  ) : null}
                  {Object.keys(a.payload).length > 0 ? (
                    <div className="mt-2 rounded-2xl border border-[rgba(var(--text)/0.06)] bg-[rgba(var(--text)/0.03)] p-3">
                      <pre className="text-[11px] leading-relaxed text-[rgba(var(--text)/0.65)] whitespace-pre-wrap break-words">
                        {JSON.stringify(a.payload, null, 2)}
                      </pre>
                    </div>
                  ) : null}
                </div>
              </div>
              {a.status === "PENDING" ? (
                <div className="flex shrink-0 flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => decide(a.id, "approve")}
                    className="focus-ring pressable inline-flex h-8 items-center gap-1 rounded-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent2))] px-3 text-caption font-semibold text-white"
                  >
                    <Check className="h-3 w-3" />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => decide(a.id, "reject")}
                    className="focus-ring pressable inline-flex h-8 items-center gap-1 rounded-full border border-[rgba(var(--text)/0.12)] bg-[rgba(var(--text)/0.04)] px-3 text-caption font-medium hover:bg-[rgba(var(--text)/0.08)]"
                  >
                    <X className="h-3 w-3" />
                    Reject
                  </button>
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
    PENDING: { icon: Clock, cls: "status-pending" },
    COMPLETED: { icon: Check, cls: "status-completed" },
    FAILED: { icon: X, cls: "status-review" },
  }[status];
  const Icon = map.icon;
  return (
    <span className={cn(map.cls)}>
      <Icon className="h-2.5 w-2.5" />
      {status.toLowerCase()}
    </span>
  );
}
