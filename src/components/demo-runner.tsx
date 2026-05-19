"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  "Reading the request",
  "Classifying intent",
  "Extracting facts",
  "Choosing actions",
  "Drafting response",
  "Creating tasks",
  "Flagging review status",
];

export function DemoRunner({ pending }: { pending: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= STEPS.length) return;
    // While the API call is in flight, walk through steps gradually.
    // Once the API resolves, jump to the last step.
    if (!pending && step < STEPS.length - 1) {
      const t = setTimeout(() => setStep(STEPS.length - 1), 200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 550);
    return () => clearTimeout(t);
  }, [step, pending]);

  return (
    <ol className="space-y-2 py-2">
      {STEPS.map((label, i) => {
        const isDone = i < step || (!pending && i <= step);
        const isActive = !isDone && i === step;
        return (
          <li
            key={label}
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
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
