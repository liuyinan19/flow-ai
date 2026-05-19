"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUSES, PRIORITIES, REQUEST_TYPES } from "@/lib/types";

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
        <SelectTrigger className="w-[150px] h-9 text-xs">
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
        <SelectTrigger className="w-[140px] h-9 text-xs">
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
        <SelectTrigger className="w-[140px] h-9 text-xs">
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

      <Button
        size="sm"
        variant={needsReview ? "default" : "outline"}
        className="h-9 text-xs"
        onClick={() => update("needsReview", needsReview ? null : "1")}
      >
        Needs review only
      </Button>

      {hasAnyFilter ? (
        <Button
          size="sm"
          variant="ghost"
          className="h-9 text-xs"
          onClick={() => router.replace(pathname)}
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      ) : null}
    </div>
  );
}
