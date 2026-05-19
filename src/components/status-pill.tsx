import { cn } from "@/lib/utils";
import type { CaseStatus } from "@/lib/types";

const STYLES: Record<CaseStatus, string> = {
  NEW: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20",
  ANALYZED: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20",
  IN_PROGRESS: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
  NEEDS_REVIEW: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
};

const LABELS: Record<CaseStatus, string> = {
  NEW: "New",
  ANALYZED: "Analyzed",
  IN_PROGRESS: "In progress",
  NEEDS_REVIEW: "Needs review",
  COMPLETED: "Completed",
};

export function StatusPill({
  status,
  className,
}: {
  status: CaseStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        STYLES[status],
        className,
      )}
    >
      {LABELS[status]}
    </span>
  );
}
