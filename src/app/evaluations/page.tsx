import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  TriangleAlert,
  Eye,
} from "lucide-react";
import { GlassCard } from "@/components/glass-card";
import { StatCard } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";
import { EVALUATIONS } from "@/data/evaluations";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Evaluations — AI Operations Agent",
};

const CATEGORY_BADGE = {
  good: {
    label: "Good answer",
    cls: "status-completed",
    icon: CheckCircle2,
  },
  bad: { label: "Bad answer", cls: "status-review", icon: AlertTriangle },
  "source-mismatch": { label: "Source mismatch", cls: "status-pending", icon: Eye },
  hallucination: {
    label: "Hallucination risk",
    cls: "status-review",
    icon: TriangleAlert,
  },
};

export default function EvaluationsPage() {
  const passing = EVALUATIONS.filter((e) => e.pass).length;
  return (
    <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-caption text-[rgba(var(--text)/0.6)] hover:text-[rgb(var(--text))]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to dashboard
      </Link>

      <div className="mt-3 max-w-3xl">
        <PageHeader
          title="Evaluations"
          subtitle="A small, hand-authored eval set that captures the failure modes we care about. This is the bar we'd hold the production agent to."
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value={EVALUATIONS.length} tone="dark" />
        <StatCard label="Passing" value={passing} tone="purple" />
        <StatCard
          label="Failing"
          value={EVALUATIONS.length - passing}
          tone="yellow"
        />
        <StatCard
          label="Guardrails verified"
          value={EVALUATIONS.filter((e) => e.guardrail).length}
          tone="dark"
        />
      </div>

      <div className="mt-8 space-y-5">
        {EVALUATIONS.map((e) => {
          const cat = CATEGORY_BADGE[e.category];
          const CatIcon = cat.icon;
          return (
            <GlassCard key={e.id} className="overflow-hidden" padded>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className={cn(cat.cls)}>
                      <CatIcon className="h-3 w-3" />
                      {cat.label}
                    </span>
                    <code className="rounded bg-[rgba(var(--text)/0.06)] px-1.5 py-0.5 text-[10px] text-[rgba(var(--text)/0.65)]">
                      {e.id}
                    </code>
                  </div>
                  <h3 className="text-body-lg font-semibold">{e.title}</h3>
                </div>
                <PassFailBadge pass={e.pass} />
              </div>
              <p className="mt-3 text-body-sm text-[rgba(var(--text)/0.75)]">
                <span className="font-semibold text-[rgb(var(--text))]">
                  What happened:{" "}
                </span>
                {e.whatHappened}
              </p>

              <div className="mt-4 space-y-4">
                <Section title="Input">
                  <pre className="rounded-2xl border border-[rgba(var(--text)/0.06)] bg-[rgba(var(--text)/0.03)] p-3 text-caption whitespace-pre-wrap">
                    {e.input}
                  </pre>
                </Section>

                <div className="grid gap-3 lg:grid-cols-2">
                  <OutputColumn
                    title="AI output"
                    rows={[
                      ["Request type", e.aiOutput.requestType],
                      ["Priority", e.aiOutput.priority],
                      [
                        "Confidence",
                        `${Math.round(e.aiOutput.confidence * 100)}%`,
                      ],
                      ["Needs review", e.aiOutput.needsHumanReview ? "yes" : "no"],
                    ]}
                    facts={e.aiOutput.keyFacts}
                    actions={e.aiOutput.actionsChosen}
                    draftSnippet={e.aiOutput.draftResponseSnippet}
                  />
                  <OutputColumn
                    title="Expected"
                    rows={[
                      ["Request type", e.expected.requestType],
                      ["Priority", e.expected.priority],
                      ["Needs review", e.expected.needsHumanReview ? "yes" : "no"],
                    ]}
                    facts={e.expected.keyFacts}
                    actions={e.expected.actionsChosen}
                  />
                </div>

                <div className="rounded-2xl border border-[rgba(var(--accent)/0.20)] bg-[rgba(var(--accent)/0.06)] p-3 text-body-sm">
                  <div className="mb-1 flex items-center gap-2 text-overline uppercase tracking-wide text-[rgb(var(--accent))]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Guardrail
                  </div>
                  <p className="text-[rgba(var(--text)/0.85)]">{e.guardrail}</p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

function PassFailBadge({ pass }: { pass: boolean }) {
  return (
    <span className={pass ? "status-completed" : "status-review"}>
      {pass ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <XCircle className="h-3 w-3" />
      )}
      {pass ? "Pass" : "Fail"}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-1.5 text-overline uppercase tracking-wide text-[rgba(var(--text)/0.55)]">
        {title}
      </h4>
      {children}
    </div>
  );
}

function OutputColumn({
  title,
  rows,
  facts,
  actions,
  draftSnippet,
}: {
  title: string;
  rows: [string, string][];
  facts: string[];
  actions: string[];
  draftSnippet?: string;
}) {
  return (
    <div className="rounded-2xl border border-[rgba(var(--text)/0.06)] bg-[rgba(var(--text)/0.03)] p-3">
      <h4 className="mb-2 text-overline uppercase tracking-wide text-[rgba(var(--text)/0.55)]">
        {title}
      </h4>
      <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-caption">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-[rgba(var(--text)/0.55)]">{k}</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-2">
        <p className="text-overline uppercase tracking-wide text-[rgba(var(--text)/0.55)]">
          Key facts
        </p>
        <ul className="mt-1 text-caption">
          {facts.map((f, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-current opacity-60" />
              {f}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-2">
        <p className="text-overline uppercase tracking-wide text-[rgba(var(--text)/0.55)]">
          Actions chosen
        </p>
        <ul className="mt-1 text-caption">
          {actions.map((a, i) => (
            <li key={i}>· {a}</li>
          ))}
        </ul>
      </div>
      {draftSnippet ? (
        <div className="mt-2">
          <p className="text-overline uppercase tracking-wide text-[rgba(var(--text)/0.55)]">
            Draft snippet
          </p>
          <p className="mt-1 rounded-xl border border-[rgba(var(--text)/0.06)] bg-[rgba(var(--text)/0.03)] p-2 text-caption italic">
            “{draftSnippet}”
          </p>
        </div>
      ) : null}
    </div>
  );
}
