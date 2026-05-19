import { cn } from "@/lib/utils";
import type { CaseStatus } from "@/lib/types";

const CLASS_MAP: Record<CaseStatus, string> = {
  NEW: "status-new",
  ANALYZED: "status-progress",
  IN_PROGRESS: "status-pending",
  NEEDS_REVIEW: "status-review",
  COMPLETED: "status-completed",
};

const LABELS: Record<CaseStatus, string> = {
  NEW: "New",
  ANALYZED: "Analyzed",
  IN_PROGRESS: "In progress",
  NEEDS_REVIEW: "Needs review",
  COMPLETED: "Completed",
};

const DOT_TONE: Record<CaseStatus, string> = {
  NEW: "bg-[rgb(var(--accent-deep))]",
  ANALYZED: "bg-[rgb(var(--accent))]",
  IN_PROGRESS: "bg-[rgb(var(--accent2))]",
  NEEDS_REVIEW: "bg-[rgb(var(--red))]",
  COMPLETED: "bg-[rgb(var(--green))]",
};

export function StatusPill({
  status,
  className,
}: {
  status: CaseStatus;
  className?: string;
}) {
  return (
    <span className={cn(CLASS_MAP[status], className)}>
      <span
        className={cn("h-1.5 w-1.5 rounded-full", DOT_TONE[status])}
        aria-hidden
      />
      {LABELS[status]}
    </span>
  );
}
