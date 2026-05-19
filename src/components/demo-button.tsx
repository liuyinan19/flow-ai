"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DemoRunner, type DemoStepKey } from "@/components/demo-runner";
import { cn } from "@/lib/utils";

export function DemoButton({
  size = "default",
  className,
}: {
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState<Set<DemoStepKey>>(new Set());
  const [active, setActive] = useState<DemoStepKey | null>(null);
  const [done, setDone] = useState(false);

  const sizeClass =
    size === "sm" ? "h-9 px-4 text-caption" : size === "lg" ? "h-12 px-7 text-body-lg" : "h-11 px-6 text-sm";

  const start = async () => {
    setRunning(true);
    setCompleted(new Set());
    setActive(null);
    setDone(false);

    try {
      const res = await fetch("/api/demo", { method: "POST" });
      if (!res.ok || !res.body) {
        throw new Error(`Demo failed to start (HTTP ${res.status}).`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalCaseId: string | null = null;

      while (true) {
        const { value, done: streamDone } = await reader.read();
        if (streamDone) break;
        buffer += decoder.decode(value, { stream: true });
        let sep: number;
        while ((sep = buffer.indexOf("\n\n")) !== -1) {
          const frame = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);
          const evt = parseFrame(frame);
          if (!evt) continue;
          if (evt.event === "step") {
            const name = evt.data.name as DemoStepKey;
            setActive((prev) => {
              if (prev && prev !== name) {
                setCompleted((c) => new Set(c).add(prev));
              }
              return name;
            });
          } else if (evt.event === "complete") {
            setActive((prev) => {
              if (prev) setCompleted((c) => new Set(c).add(prev));
              return null;
            });
            setDone(true);
            finalCaseId = (evt.data as { caseId: string }).caseId;
          } else if (evt.event === "error") {
            throw new Error(
              (evt.data as { message: string }).message ?? "Demo failed.",
            );
          }
        }
      }

      if (!finalCaseId) throw new Error("Demo stream ended without a case ID.");
      setTimeout(() => {
        router.push(`/cases/${finalCaseId}`);
      }, 600);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Demo failed.");
      setRunning(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={start}
        disabled={running}
        className={cn(
          "focus-ring pressable inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-shadow",
          "bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent2))] text-white",
          "shadow-[0_8px_24px_-8px_rgba(168,162,255,0.55)] hover:shadow-[0_12px_32px_-8px_rgba(168,162,255,0.75)]",
          "disabled:cursor-not-allowed disabled:opacity-70",
          sizeClass,
          className,
        )}
      >
        {running ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        Run demo case
      </button>
      <Dialog open={running} onOpenChange={() => {}}>
        <DialogContent className="card-glass sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Running demo case</DialogTitle>
            <DialogDescription>
              Streaming live pipeline events from the server. You&apos;ll be
              redirected to the case detail when it finishes.
            </DialogDescription>
          </DialogHeader>
          <DemoRunner completed={completed} active={active} done={done} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function parseFrame(frame: string): { event: string; data: Record<string, unknown> } | null {
  const lines = frame.split("\n").filter(Boolean);
  let event = "message";
  const dataLines: string[] = [];
  for (const line of lines) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
  }
  if (dataLines.length === 0) return null;
  try {
    return { event, data: JSON.parse(dataLines.join("\n")) };
  } catch {
    return null;
  }
}
