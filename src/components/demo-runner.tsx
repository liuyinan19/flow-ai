"use client";

import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const DEMO_STEPS = [
  { key: "reading", label: "Reading the request" },
  { key: "classifying", label: "Classifying intent" },
  { key: "extracting", label: "Extracting facts" },
  { key: "choosing_actions", label: "Choosing actions" },
  { key: "drafting", label: "Drafting response" },
  { key: "creating_tasks", label: "Creating tasks" },
  { key: "flagging", label: "Flagging review status" },
] as const;

export type DemoStepKey = (typeof DEMO_STEPS)[number]["key"];

interface DemoRunnerProps {
  /** Steps that have been completed (received from the server stream). */
  completed: Set<DemoStepKey>;
  /** The step currently in flight, if any. */
  active: DemoStepKey | null;
  /** True once the server has emitted "complete". */
  done: boolean;
}

export function DemoRunner({ completed, active, done }: DemoRunnerProps) {
  return (
    <ol className="space-y-2 py-2">
      {DEMO_STEPS.map((step, i) => {
        const isDone = done || completed.has(step.key);
        const isActive = !isDone && active === step.key;
        return (
          <li
            key={step.key}
            className={cn(
              "flex items-center gap-3 rounded-md border border-transparent px-2 py-1.5 text-sm",
              isActive && "bg-muted/60",
            )}
          >
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full",
                isDone
                  ? "bg-emerald-500 text-white"
                  : isActive
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {isDone ? (
                <Check className="h-3 w-3" />
              ) : isActive ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <span className="text-[10px]">{i + 1}</span>
              )}
            </span>
            <span
              className={cn(
                isDone
                  ? "text-foreground"
                  : isActive
                    ? "font-medium"
                    : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
