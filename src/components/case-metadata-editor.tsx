"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

interface Props {
  caseId: string;
  requestType: string | null;
  priority: string | null;
  assignedTeam: string | null;
}

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
    <div className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Request type</Label>
        <Select value={t || undefined} onValueChange={(v) => setT(v as RequestType)}>
          <SelectTrigger>
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
        <Label className="text-xs">Priority</Label>
        <Select value={p || undefined} onValueChange={(v) => setP(v as Priority)}>
          <SelectTrigger>
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
        <Label className="text-xs">Assigned team</Label>
        <Input
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          placeholder="e.g. Billing"
        />
      </div>
      <div className="sm:col-span-3 flex items-center justify-end">
        <Button
          size="sm"
          variant="outline"
          disabled={!dirty || saving}
          onClick={save}
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Save changes
        </Button>
      </div>
    </div>
  );
}
