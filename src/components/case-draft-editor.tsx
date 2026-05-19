"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Mail, Save, RefreshCcw, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function CaseDraftEditor({
  caseId,
  initialDraft,
}: {
  caseId: string;
  initialDraft: string;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(initialDraft);
  const [baseline, setBaseline] = useState(initialDraft);
  const [saving, setSaving] = useState(false);
  const [regeneratingDraft, setRegeneratingDraft] = useState(false);
  const [regeneratingAll, setRegeneratingAll] = useState(false);
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
    <div className="card-glass grain p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-[rgb(var(--accent))]" />
          <h3 className="text-body-sm font-semibold">Draft customer response</h3>
        </div>
        <span className="text-overline uppercase tracking-wide text-[rgba(var(--text)/0.5)]">
          Stored only — not sent until approved
        </span>
      </div>
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={10}
        className="resize-y min-h-[200px] rounded-2xl border-[rgba(var(--text)/0.1)] bg-[rgba(var(--text)/0.04)] font-mono text-body-sm focus-ring"
        disabled={busy}
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-caption text-[rgba(var(--text)/0.6)]">
          {dirty ? "Unsaved changes" : "Up to date"}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={regenerateDraft}
            disabled={busy}
            title="Re-run only the draft response, keep classification + tasks."
            className={cn(
              "focus-ring pressable inline-flex h-9 items-center gap-1.5 rounded-full border border-[rgba(var(--text)/0.12)] bg-[rgba(var(--text)/0.04)] px-4 text-caption font-medium hover:bg-[rgba(var(--text)/0.08)]",
              busy && "cursor-not-allowed opacity-50",
            )}
          >
            {regeneratingDraft ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            Regenerate draft
          </button>
          <button
            type="button"
            onClick={regenerateAll}
            disabled={busy}
            title="Re-run the full pipeline — replaces analysis, tasks, and tool actions."
            className={cn(
              "focus-ring pressable inline-flex h-9 items-center gap-1.5 rounded-full border border-[rgba(var(--text)/0.12)] bg-[rgba(var(--text)/0.04)] px-4 text-caption font-medium hover:bg-[rgba(var(--text)/0.08)]",
              busy && "cursor-not-allowed opacity-50",
            )}
          >
            {regeneratingAll ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCcw className="h-3.5 w-3.5" />
            )}
            Regenerate analysis
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!dirty || busy}
            className={cn(
              "focus-ring pressable inline-flex h-9 items-center gap-1.5 rounded-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent2))] px-4 text-caption font-semibold text-white shadow-[0_8px_24px_-8px_rgba(168,162,255,0.55)]",
              (!dirty || busy) && "cursor-not-allowed opacity-60",
            )}
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save draft
          </button>
        </div>
      </div>
    </div>
  );
}
