"use client";

import { MDiv, premiumEase } from "@/components/motion";
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
      <span className={cn("text-caption text-[rgba(var(--text)/0.55)]", className)}>
        —
      </span>
    );
  }
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);

  // Gradient fill — purple → yellow at high confidence, red on low.
  const gradient =
    value < 0.6
      ? "linear-gradient(90deg, rgb(var(--red)) 0%, rgba(var(--red)/0.7) 100%)"
      : value < 0.75
        ? "linear-gradient(90deg, rgb(var(--accent2)) 0%, rgba(var(--accent2-deep)) 100%)"
        : "linear-gradient(90deg, rgb(var(--accent)) 0%, rgb(var(--accent2)) 100%)";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[rgba(var(--text)/0.08)]">
        <MDiv
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: premiumEase }}
          className="h-full rounded-full"
          style={{ background: gradient }}
        />
      </div>
      {showLabel ? (
        <span className="text-caption tabular-nums text-[rgba(var(--text)/0.65)]">
          {pct}%
        </span>
      ) : null}
    </div>
  );
}
