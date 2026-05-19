"use client";

import { format, formatDistanceToNow } from "date-fns";
import {
  Inbox,
  Sparkles,
  ArrowRightLeft,
  Pencil,
  Wrench,
  CheckCheck,
  ListChecks,
  RefreshCcw,
} from "lucide-react";
import { MDiv, premiumEase } from "@/components/motion";

interface ActivityRow {
  id: string;
  eventType: string;
  message: string;
  createdAt: Date;
}

const ICONS: Record<string, React.ElementType> = {
  case_created: Inbox,
  analysis_completed: Sparkles,
  analysis_regenerated: RefreshCcw,
  draft_regenerated: Sparkles,
  status_change: ArrowRightLeft,
  human_edit: Pencil,
  tool_call: Wrench,
  tool_decision: CheckCheck,
  task_update: ListChecks,
};

export function CaseTimeline({ events }: { events: ActivityRow[] }) {
  if (events.length === 0) {
    return (
      <p className="text-body-sm text-[rgba(var(--text)/0.6)]">
        No activity yet — the timeline fills in as the case moves.
      </p>
    );
  }

  return (
    <ol className="relative space-y-3 border-l border-[rgba(var(--text)/0.1)] pl-5">
      {events.map((e, i) => {
        const Icon = ICONS[e.eventType] ?? Sparkles;
        return (
          <MDiv
            key={e.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.35,
              ease: premiumEase,
              delay: Math.min(i, 6) * 0.04,
            }}
            className="relative"
          >
            <span className="absolute -left-[27px] mt-0.5 inline-grid h-5 w-5 place-items-center rounded-full border border-[rgba(var(--text)/0.12)] bg-[rgb(var(--bgB))] text-[rgba(var(--text)/0.7)]">
              <Icon className="h-3 w-3" />
            </span>
            <div className="rounded-2xl border border-[rgba(var(--text)/0.06)] bg-[rgba(var(--text)/0.03)] p-3">
              <p className="text-body-sm">{e.message}</p>
              <p
                className="mt-0.5 text-[11px] text-[rgba(var(--text)/0.55)]"
                title={format(e.createdAt, "PPpp")}
              >
                {formatDistanceToNow(e.createdAt, { addSuffix: true })}
                <span className="mx-1.5 opacity-50">·</span>
                <code className="rounded bg-[rgba(var(--text)/0.06)] px-1 py-0.5 text-[10px]">
                  {e.eventType}
                </code>
              </p>
            </div>
          </MDiv>
        );
      })}
    </ol>
  );
}
