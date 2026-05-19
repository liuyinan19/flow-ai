"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PRIORITIES,
  REQUEST_TYPES,
  type Priority,
  type RequestType,
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  caseId: string;
  requestType: string | null;
  priority: string | null;
  assignedTeam: string | null;
}

const FIELD_CLASS =
  "h-10 rounded-xl border-[rgba(var(--text)/0.1)] bg-[rgba(var(--text)/0.04)] focus-ring";

export function CaseMetadataEditor({
  caseId,
  requestType,
  priority,
  assignedTeam,
}: Props) {
  const router = useRouter();
  const [t, setT] = useState<string>(requestType ?? "");
  const [p, setP] = useState<string>(priority ?? "");
  const [team, setTeam] = useState<string>(assignedTeam ?? "");
  const [saving, setSaving] = useState(false);
  const [, startTransition] = useTransition();

  const dirty =
    t !== (requestType ?? "") ||
    p !== (priority ?? "") ||
    team !== (assignedTeam ?? "");

  const save = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {};
      if (t && t !== (requestType ?? "")) body.requestType = t;
      if (p && p !== (priority ?? "")) body.priority = p;
      if (team !== (assignedTeam ?? "")) body.assignedTeam = team;

      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Save failed.");
      }
      toast.success("Metadata updated. Logged as a human edit.");
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card-glass grain grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
      <div className="space-y-1.5">
        <Label className="text-caption font-medium text-[rgba(var(--text)/0.7)]">
          Request type
        </Label>
        <Select value={t || undefined} onValueChange={(v) => setT(v as RequestType)}>
          <SelectTrigger className={FIELD_CLASS}>
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {REQUEST_TYPES.map((rt) => (
              <SelectItem key={rt} value={rt}>
                {rt.toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-caption font-medium text-[rgba(var(--text)/0.7)]">
          Priority
        </Label>
        <Select value={p || undefined} onValueChange={(v) => setP(v as Priority)}>
          <SelectTrigger className={FIELD_CLASS}>
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {PRIORITIES.map((pp) => (
              <SelectItem key={pp} value={pp}>
                {pp.toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-caption font-medium text-[rgba(var(--text)/0.7)]">
          Assigned team
        </Label>
        <Input
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          placeholder="e.g. Billing"
          className={FIELD_CLASS}
        />
      </div>
      <div className="sm:col-span-3 flex items-center justify-end">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving}
          className={cn(
            "focus-ring pressable inline-flex h-9 items-center gap-1.5 rounded-full border border-[rgba(var(--text)/0.12)] bg-[rgba(var(--text)/0.04)] px-4 text-caption font-medium hover:bg-[rgba(var(--text)/0.08)]",
            (!dirty || saving) && "cursor-not-allowed opacity-50",
          )}
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Save changes
        </button>
      </div>
    </div>
  );
}
