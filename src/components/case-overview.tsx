import { formatDistanceToNow, format } from "date-fns";
import { ShieldAlert, Sparkles, TriangleAlert } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { PriorityPill } from "@/components/priority-pill";
import { ConfidenceBar } from "@/components/confidence-bar";
import { GlassCard } from "@/components/glass-card";
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
  LOW: "border-[rgba(var(--text)/0.10)] bg-[rgba(var(--text)/0.04)] text-[rgba(var(--text)/0.85)]",
  MEDIUM:
    "border-[rgba(var(--accent2)/0.30)] bg-[rgba(var(--accent2)/0.10)] text-[rgb(var(--accent2))]",
  HIGH: "border-[rgba(var(--red)/0.30)] bg-[rgba(var(--red)/0.10)] text-[rgb(var(--red))]",
};

export function CaseOverview({ case_, analysis }: OverviewProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {case_.needsHumanReview ? (
          <div
            className="flex items-start gap-3 rounded-3xl border border-[rgba(var(--red)/0.25)] bg-[rgba(var(--red)/0.08)] p-4 text-body-sm"
            style={{ boxShadow: "0 8px 32px -8px rgba(230, 90, 90, 0.25)" }}
          >
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--red))]" />
            <div>
              <p className="font-semibold text-[rgb(var(--red))]">
                Held for human review.
              </p>
              <p className="text-[rgba(var(--text)/0.75)]">
                Our guardrails flagged this case. Approve or edit the AI&apos;s
                output before any tool action proceeds.
              </p>
            </div>
          </div>
        ) : null}

        <GlassCard padded>
          <h3 className="text-overline uppercase tracking-wide text-[rgba(var(--text)/0.55)]">
            AI summary
          </h3>
          <p className="mt-2 text-body leading-relaxed">
            {analysis?.summary ?? "No analysis yet."}
          </p>
          {analysis?.classificationReason ? (
            <div className="mt-3 flex items-start gap-2 rounded-2xl border border-[rgba(var(--text)/0.06)] bg-[rgba(var(--text)/0.03)] p-3 text-caption text-[rgba(var(--text)/0.7)]">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[rgb(var(--accent))]" />
              <span>
                <span className="font-semibold text-[rgb(var(--text))]">
                  Classification reasoning —{" "}
                </span>
                {analysis.classificationReason}
              </span>
            </div>
          ) : null}
        </GlassCard>

        <GlassCard padded>
          <h3 className="text-overline mb-2 uppercase tracking-wide text-[rgba(var(--text)/0.55)]">
            Original input
          </h3>
          <div className="rounded-2xl border border-[rgba(var(--text)/0.06)] bg-[rgba(var(--text)/0.03)] p-4 text-body-sm leading-relaxed whitespace-pre-wrap">
            {case_.rawInput}
          </div>
        </GlassCard>

        {analysis && analysis.riskFlags.length > 0 ? (
          <GlassCard padded>
            <div className="mb-3 flex items-center gap-2">
              <TriangleAlert className="h-4 w-4 text-[rgb(var(--accent2))]" />
              <h3 className="text-body-sm font-semibold">Risk flags</h3>
            </div>
            <ul className="space-y-2">
              {analysis.riskFlags.map((f, i) => (
                <li
                  key={`${f.type}-${i}`}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border p-3 text-caption",
                    SEVERITY_TONE[f.severity],
                  )}
                >
                  <span className="inline-flex h-5 items-center rounded-full bg-[rgba(var(--text)/0.06)] px-2 text-[10px] font-semibold uppercase tracking-wide">
                    {f.severity}
                  </span>
                  <div>
                    <p className="text-body-sm font-semibold">{f.type}</p>
                    <p className="text-caption opacity-85">{f.reason}</p>
                  </div>
                </li>
              ))}
            </ul>
          </GlassCard>
        ) : null}
      </div>

      <aside className="card-glass grain space-y-3 p-5">
        <h3 className="text-overline uppercase tracking-wide text-[rgba(var(--text)/0.55)]">
          Case metadata
        </h3>
        <dl className="grid gap-3 text-caption">
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
              <span className="capitalize">
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
                <div className="text-[10px] text-[rgba(var(--text)/0.55)]">
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
      <dt className="text-[rgba(var(--text)/0.55)]">{label}</dt>
      <dd className="text-right font-medium text-[rgb(var(--text))]">{children}</dd>
    </div>
  );
}
