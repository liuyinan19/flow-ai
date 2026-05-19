"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DemoRunner } from "@/components/demo-runner";

export function DemoButton({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [pending, setPending] = useState(false);

  const start = async () => {
    setRunning(true);
    setPending(true);
    try {
      const res = await fetch("/api/demo", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.caseId) {
        throw new Error(json.error ?? "Demo failed to start.");
      }
      // Show the runner finish before redirect — runner waits for `done` prop.
      setTimeout(() => {
        router.push(`/cases/${json.caseId}`);
      }, 600);
      setPending(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Demo failed.",
      );
      setRunning(false);
      setPending(false);
    }
  };

  return (
    <>
      <Button
        size={size}
        variant={variant}
        className={className}
        onClick={start}
        disabled={running}
      >
        {running ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        Run demo case
      </Button>
      <Dialog open={running} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Running demo case</DialogTitle>
            <DialogDescription>
              Watch the AI Operations Agent pipeline run end-to-end. You&apos;ll be
              redirected to the case detail when it finishes.
            </DialogDescription>
          </DialogHeader>
          <DemoRunner pending={pending} />
        </DialogContent>
      </Dialog>
    </>
  );
}
