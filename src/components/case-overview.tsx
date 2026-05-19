import { formatDistanceToNow, format } from "date-fns";
import {
  ShieldAlert,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { PriorityPill } from "@/components/priority-pill";
import { ConfidenceBar } from "@/components/confidence-bar";
import { cn } from "@/lib/utils";
import type {
  CaseStatus,
  Priority,
  RiskFlag,
  RiskSeverity,
} from "@/lib/types";

interface OverviewProps {
  case_: {
    id: string;
    title: string;
    customerName: string | null;
    customerEmail: string | null;
    status: string;
    priority: string | null;
    requestType: string | null;
    confidence: number | null;
    needsHumanReview: boolean;
    assignedTeam: string | null;
    inputType: string;
    rawInput: string;
    createdAt: Date;
    updatedAt: Date;
  };
  analysis: {
    summary: string;
    classificationReason: string;
    riskFlags: RiskFlag[];
  } | null;
}

const SEVERITY_TONE: Record<RiskSeverity, string> = {
  LOW: "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-500/30 dark:bg-zinc-500/10 dark:text-zinc-300",
  MEDIUM:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
  HIGH:
    "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200",
};

export function CaseOverview({ case_, analysis }: OverviewProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        {case_.needsHumanReview ? (
          <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Held for human review.</p>
              <p className="text-rose-800/80 dark:text-rose-200/80">
                Our guardrails flagged this case. Approve or edit the AI&apos;s
                output before any tool action proceeds.
              </p>
            </div>
          </div>
        ) : null}

        <section className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            AI summary
          </h3>
          <p className="mt-2 text-sm leading-relaxed">
            {analysis?.summary ?? "No analysis yet."}
          </p>
          {analysis?.classificationReason ? (
            <div className="mt-3 flex items-start gap-2 rounded-md border border-border bg-muted/40 p-2.5 text-xs text-muted-foreground">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                <span className="font-medium text-foreground">
                  Classification reasoning —
                </span>{" "}
                {analysis.classificationReason}
              </span>
            </div>
          ) : null}
        </section>

        <section className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">
            Original input
          </h3>
          <div className="rounded-md border border-border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
            {case_.rawInput}
          </div>
        </section>

        {analysis && analysis.riskFlags.length > 0 ? (
          <section className="rounded-lg border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <TriangleAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-medium">Risk flags</h3>
            </div>
            <ul className="space-y-2">
              {analysis.riskFlags.map((f, i) => (
                <li
                  key={`${f.type}-${i}`}
                  className={cn(
                    "flex items-start gap-3 rounded-md border p-2.5 text-xs",
                    SEVERITY_TONE[f.severity],
                  )}
                >
                  <span className="inline-flex h-5 items-center rounded-full bg-background/70 px-2 text-[10px] font-semibold uppercase ring-1 ring-inset ring-border">
                    {f.severity}
                  </span>
                  <div>
                    <p className="font-medium">{f.type}</p>
                    <p className="opacity-80">{f.reason}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <aside className="space-y-2 rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-medium">Case metadata</h3>
        <dl className="grid gap-3 text-xs">
          <Row label="Status">
            <StatusPill status={case_.status as CaseStatus} />
          </Row>
          <Row label="Priority">
            {case_.priority ? (
              <PriorityPill priority={case_.priority as Priority} />
            ) : (
              "—"
            )}
          </Row>
          <Row label="Confidence">
            <ConfidenceBar value={case_.confidence} />
          </Row>
          <Row label="Type">
            {case_.requestType ? (
              <span className="text-foreground">
                {case_.requestType.toLowerCase()}
              </span>
            ) : (
              "—"
            )}
          </Row>
          <Row label="Assigned team">{case_.assignedTeam ?? "—"}</Row>
          <Row label="Customer">
            <div className="text-right">
              <div>{case_.customerName ?? "—"}</div>
              {case_.customerEmail ? (
                <div className="text-muted-foreground">
                  {case_.customerEmail}
                </div>
              ) : null}
            </div>
          </Row>
          <Row label="Source">{case_.inputType.toLowerCase()}</Row>
          <Row label="Created">
            <span title={format(case_.createdAt, "PPpp")}>
              {formatDistanceToNow(case_.createdAt, { addSuffix: true })}
            </span>
          </Row>
          <Row label="Updated">
            <span title={format(case_.updatedAt, "PPpp")}>
              {formatDistanceToNow(case_.updatedAt, { addSuffix: true })}
            </span>
          </Row>
        </dl>
      </aside>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{children}</dd>
    </div>
  );
}
