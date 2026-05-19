import { cn } from "@/lib/utils";
import type { Priority } from "@/lib/types";

const CLASS_MAP: Record<Priority, string> = {
  LOW: "status-progress",
  MEDIUM: "status-new",
  HIGH: "status-pending",
  URGENT: "status-review",
};

export function PriorityPill({
  priority,
  className,
}: {
  priority: Priority;
  className?: string;
}) {
  return (
    <span className={cn(CLASS_MAP[priority], "capitalize", className)}>
      {priority.toLowerCase()}
    </span>
  );
}
