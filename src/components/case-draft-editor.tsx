"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Mail, Save, RefreshCcw, Sparkles, Loader2 } from "lucide-react";
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
  const [regeneratingDraft, setRegeneratingDraft] = useState(false);
  const [regeneratingAll, setRegeneratingAll] = useState(false);
  const [baseline, setBaseline] = useState(initialDraft);
  const [, startTransition] = useTransition();

  const dirty = draft !== baseline;
  const busy = saving || regeneratingDraft || regeneratingAll;

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
      setBaseline(draft);
      toast.success("Draft saved. Logged as a human edit.");
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const regenerateDraft = async () => {
    setRegeneratingDraft(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/regenerate-draft`, {
        method: "POST",
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error ?? "Regenerate failed.");
      if (typeof j.draftResponse === "string") {
        setDraft(j.draftResponse);
        setBaseline(j.draftResponse);
      }
      toast.success(`Draft regenerated (${j.source}).`);
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Regenerate failed.");
    } finally {
      setRegeneratingDraft(false);
    }
  };

  const regenerateAll = async () => {
    setRegeneratingAll(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/regenerate`, {
        method: "POST",
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error ?? "Regenerate failed.");
      if (typeof j.draftResponse === "string") {
        setDraft(j.draftResponse);
        setBaseline(j.draftResponse);
      }
      toast.success(`Full analysis regenerated (${j.source}).`);
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Regenerate failed.");
    } finally {
      setRegeneratingAll(false);
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
        disabled={busy}
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {dirty ? "Unsaved changes" : "Up to date"}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={regenerateDraft}
            disabled={busy}
            title="Re-run only the draft response, keep classification + tasks."
          >
            {regeneratingDraft ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            Regenerate draft
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={regenerateAll}
            disabled={busy}
            title="Re-run the full pipeline — replaces analysis, tasks, and tool actions."
          >
            {regeneratingAll ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCcw className="h-3.5 w-3.5" />
            )}
            Regenerate analysis
          </Button>
          <Button size="sm" onClick={save} disabled={!dirty || busy}>
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
