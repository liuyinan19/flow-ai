import { cn } from "@/lib/utils";
import type { Priority } from "@/lib/types";

const STYLES: Record<Priority, string> = {
  LOW: "bg-zinc-50 text-zinc-700 ring-zinc-200 dark:bg-zinc-500/10 dark:text-zinc-300 dark:ring-zinc-500/20",
  MEDIUM: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20",
  HIGH: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
  URGENT: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20",
};

export function PriorityPill({
  priority,
  className,
}: {
  priority: Priority;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset capitalize",
        STYLES[priority],
        className,
      )}
    >
      {priority.toLowerCase()}
    </span>
  );
}
