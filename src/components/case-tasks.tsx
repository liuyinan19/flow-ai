"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Circle, CircleDashed, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/lib/types";

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: string;
  ownerTeam: string | null;
}

const NEXT: Record<TaskStatus, TaskStatus> = {
  TODO: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  DONE: "TODO",
};

const ICONS: Record<TaskStatus, React.ElementType> = {
  TODO: Circle,
  IN_PROGRESS: CircleDashed,
  DONE: CheckCircle2,
};

const TONES: Record<TaskStatus, string> = {
  TODO: "text-[rgba(var(--text)/0.5)]",
  IN_PROGRESS: "text-[rgb(var(--accent2))]",
  DONE: "text-[rgb(var(--green))]",
};

export function CaseTasks({
  caseId,
  tasks,
}: {
  caseId: string;
  tasks: TaskRow[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  if (tasks.length === 0) {
    return (
      <p className="text-body-sm text-[rgba(var(--text)/0.6)]">
        No tasks yet — they appear here after the AI generates a checklist.
      </p>
    );
  }

  const advance = async (task: TaskRow) => {
    const current = task.status as TaskStatus;
    const next = NEXT[current];
    const res = await fetch(`/api/cases/${caseId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: task.id, status: next }),
    });
    if (!res.ok) {
      toast.error("Couldn't update task.");
      return;
    }
    startTransition(() => router.refresh());
  };

  return (
    <ul className="space-y-2">
      {tasks.map((t) => {
        const status = t.status as TaskStatus;
        const Icon = ICONS[status];
        return (
          <li
            key={t.id}
            className="flex items-start gap-3 rounded-2xl border border-[rgba(var(--text)/0.06)] bg-[rgba(var(--text)/0.03)] p-3 transition-colors hover:bg-[rgba(var(--text)/0.05)]"
          >
            <button
              type="button"
              onClick={() => advance(t)}
              className={cn(
                "focus-ring pressable mt-0.5 inline-grid h-6 w-6 place-items-center rounded-full hover:opacity-80",
                TONES[status],
              )}
              aria-label={`Mark task as ${NEXT[status].toLowerCase().replace("_", " ")}`}
            >
              <Icon className="h-4 w-4" />
            </button>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <p
                  className={cn(
                    "text-body-sm font-medium",
                    status === "DONE" &&
                      "text-[rgba(var(--text)/0.55)] line-through",
                  )}
                >
                  {t.title}
                </p>
                {t.ownerTeam ? (
                  <span className="text-overline uppercase tracking-wide text-[rgba(var(--text)/0.55)]">
                    {t.ownerTeam}
                  </span>
                ) : null}
              </div>
              {t.description ? (
                <p className="mt-0.5 text-caption text-[rgba(var(--text)/0.65)]">
                  {t.description}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
