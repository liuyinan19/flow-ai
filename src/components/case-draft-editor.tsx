"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Mail, Save, RefreshCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function CaseDraftEditor({
  caseId,
  initialDraft,
}: {
  caseId: string;
  initialDraft: string;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(initialDraft);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [, startTransition] = useTransition();

  const dirty = draft !== initialDraft;

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftResponse: draft }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Save failed.");
      }
      toast.success("Draft saved. Logged as a human edit.");
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const regenerate = async () => {
    setRegenerating(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/regenerate`, {
        method: "POST",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Regenerate failed.");
      }
      toast.success("Analysis regenerated.");
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Regenerate failed.");
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <h3 className="text-sm font-medium">Draft customer response</h3>
        </div>
        <span className="text-[11px] text-muted-foreground">
          Stored only — not sent until approved.
        </span>
      </div>
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={10}
        className="resize-y min-h-[180px] font-mono text-sm"
      />
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {dirty ? "Unsaved changes" : "Up to date"}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={regenerate}
            disabled={regenerating}
          >
            {regenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCcw className="h-3.5 w-3.5" />
            )}
            Regenerate analysis
          </Button>
          <Button size="sm" onClick={save} disabled={!dirty || saving}>
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save draft
          </Button>
        </div>
      </div>
    </div>
  );
}
