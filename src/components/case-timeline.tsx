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
  status_change: ArrowRightLeft,
  human_edit: Pencil,
  tool_call: Wrench,
  tool_decision: CheckCheck,
  task_update: ListChecks,
};

export function CaseTimeline({ events }: { events: ActivityRow[] }) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No activity yet — the timeline fills in as the case moves.
      </p>
    );
  }

  return (
    <ol className="relative space-y-3 border-l border-border pl-5">
      {events.map((e) => {
        const Icon = ICONS[e.eventType] ?? Sparkles;
        return (
          <li key={e.id} className="relative">
            <span className="absolute -left-[27px] mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background">
              <Icon className="h-3 w-3" />
            </span>
            <div className="rounded-md border border-border bg-card p-2.5">
              <p className="text-sm">{e.message}</p>
              <p
                className="mt-0.5 text-[11px] text-muted-foreground"
                title={format(e.createdAt, "PPpp")}
              >
                {formatDistanceToNow(e.createdAt, { addSuffix: true })}
                <span className="mx-1.5 opacity-50">·</span>
                <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
                  {e.eventType}
                </code>
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
