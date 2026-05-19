"use client";

import { Check, Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { MDiv, premiumEase, snappySpring } from "@/components/motion";
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

export function DemoRunner({
  completed,
  active,
  done,
}: {
  completed: Set<DemoStepKey>;
  active: DemoStepKey | null;
  done: boolean;
}) {
  return (
    <ol className="space-y-1.5 py-2">
      {DEMO_STEPS.map((step, i) => {
        const isDone = done || completed.has(step.key);
        const isActive = !isDone && active === step.key;
        return (
          <li
            key={step.key}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-3 py-2 text-body-sm transition-colors duration-200",
              isActive && "bg-[rgba(var(--accent)/0.10)]",
            )}
          >
            <MDiv
              layout
              transition={snappySpring}
              className={cn(
                "grid h-6 w-6 place-items-center rounded-full text-[10px] font-semibold",
                isDone
                  ? "bg-[rgb(var(--green))] text-white"
                  : isActive
                    ? "bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent2))] text-white"
                    : "bg-[rgba(var(--text)/0.08)] text-[rgba(var(--text)/0.55)]",
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDone ? (
                  <MDiv
                    key="check"
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.25, ease: premiumEase }}
                  >
                    <Check className="h-3 w-3" />
                  </MDiv>
                ) : isActive ? (
                  <MDiv
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </MDiv>
                ) : (
                  <MDiv
                    key="num"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {i + 1}
                  </MDiv>
                )}
              </AnimatePresence>
            </MDiv>
            <span
              className={cn(
                "transition-colors",
                isDone
                  ? "text-[rgba(var(--text)/0.85)]"
                  : isActive
                    ? "font-semibold text-[rgb(var(--text))]"
                    : "text-[rgba(var(--text)/0.55)]",
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
