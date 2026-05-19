"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUSES, PRIORITIES, REQUEST_TYPES } from "@/lib/types";
import { cn } from "@/lib/utils";

const TRIGGER_CLASS =
  "h-9 w-[140px] rounded-full border-[rgba(var(--text)/0.12)] bg-[rgba(var(--text)/0.04)] text-caption hover:bg-[rgba(var(--text)/0.08)]";

export function CaseFilters() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const status = params.get("status") ?? "";
  const priority = params.get("priority") ?? "";
  const requestType = params.get("requestType") ?? "";
  const needsReview = params.get("needsReview") === "1";

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`);
    });
  };

  const hasAnyFilter = !!(status || priority || requestType || needsReview);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={status || "ALL"}
        onValueChange={(v) => update("status", v === "ALL" ? null : v)}
      >
        <SelectTrigger className={TRIGGER_CLASS}>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s.replace(/_/g, " ").toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={priority || "ALL"}
        onValueChange={(v) => update("priority", v === "ALL" ? null : v)}
      >
        <SelectTrigger className={TRIGGER_CLASS}>
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All priorities</SelectItem>
          {PRIORITIES.map((p) => (
            <SelectItem key={p} value={p}>
              {p.toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={requestType || "ALL"}
        onValueChange={(v) => update("requestType", v === "ALL" ? null : v)}
      >
        <SelectTrigger className={TRIGGER_CLASS}>
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All types</SelectItem>
          {REQUEST_TYPES.map((t) => (
            <SelectItem key={t} value={t}>
              {t.toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <button
        type="button"
        onClick={() => update("needsReview", needsReview ? null : "1")}
        className={cn(
          "focus-ring pressable inline-flex h-9 items-center rounded-full px-3 text-caption font-medium transition-colors",
          needsReview
            ? "pill-black"
            : "border border-[rgba(var(--text)/0.12)] bg-[rgba(var(--text)/0.04)] text-[rgba(var(--text)/0.75)] hover:bg-[rgba(var(--text)/0.08)]",
        )}
      >
        Needs review only
      </button>

      {hasAnyFilter ? (
        <button
          type="button"
          onClick={() => router.replace(pathname)}
          className="focus-ring inline-flex h-9 items-center gap-1 rounded-full px-3 text-caption text-[rgba(var(--text)/0.6)] hover:text-[rgb(var(--text))]"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      ) : null}
    </div>
  );
}
