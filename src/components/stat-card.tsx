"use client";

import * as React from "react";
import { MDiv, liquidSpring } from "@/components/motion";
import { cn } from "@/lib/utils";

export type StatTone = "purple" | "yellow" | "dark";

const TONE_CLASS: Record<StatTone, string> = {
  purple: "stat-card-purple",
  yellow: "stat-card-yellow",
  dark: "stat-card-dark",
};

const LABEL_CLASS: Record<StatTone, string> = {
  purple: "text-white/85",
  yellow: "text-[rgb(28,25,45)]/75",
  dark: "text-[rgba(var(--text)/0.65)]",
};

const VALUE_CLASS: Record<StatTone, string> = {
  purple: "text-white",
  yellow: "text-[rgb(28,25,45)]",
  dark: "text-[rgb(var(--text))]",
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "dark",
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  tone?: StatTone;
  className?: string;
}) {
  return (
    <MDiv
      whileHover={{ y: -3, scale: 1.01 }}
      transition={liquidSpring}
      className={cn(TONE_CLASS[tone], "grain p-4 sm:p-5", className)}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-overline uppercase tracking-wide",
            LABEL_CLASS[tone],
          )}
        >
          {label}
        </span>
        {icon ? (
          <span className={cn("inline-flex", LABEL_CLASS[tone])}>{icon}</span>
        ) : null}
      </div>
      <div
        className={cn(
          "mt-3 text-[28px] font-semibold tracking-tight tabular-nums leading-none",
          VALUE_CLASS[tone],
        )}
      >
        {value}
      </div>
      {hint ? (
        <p className={cn("mt-1.5 text-caption", LABEL_CLASS[tone])}>{hint}</p>
      ) : null}
    </MDiv>
  );
}
