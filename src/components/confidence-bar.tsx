import { cn } from "@/lib/utils";

export function ConfidenceBar({
  value,
  className,
  showLabel = true,
}: {
  value: number | null;
  className?: string;
  showLabel?: boolean;
}) {
  if (value == null) {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>—</span>
    );
  }
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const tone =
    value >= 0.85
      ? "bg-emerald-500"
      : value >= 0.75
        ? "bg-sky-500"
        : value >= 0.6
          ? "bg-amber-500"
          : "bg-rose-500";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full", tone)} style={{ width: `${pct}%` }} />
      </div>
      {showLabel ? (
        <span className="text-xs tabular-nums text-muted-foreground">
          {pct}%
        </span>
      ) : null}
    </div>
  );
}
