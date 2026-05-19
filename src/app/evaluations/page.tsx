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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EVALUATIONS } from "@/data/evaluations";

export const metadata = {
  title: "Evaluations — AI Operations Agent",
};

const CATEGORY_BADGE = {
  good: { label: "Good answer", tone: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20", icon: CheckCircle2 },
  bad: { label: "Bad answer", tone: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20", icon: AlertTriangle },
  "source-mismatch": { label: "Source mismatch", tone: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20", icon: Eye },
  hallucination: { label: "Hallucination risk", tone: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20", icon: TriangleAlert },
};

export default function EvaluationsPage() {
  const passing = EVALUATIONS.filter((e) => e.pass).length;
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to dashboard
      </Link>

      <div className="mt-4">
        <h1 className="text-2xl font-semibold tracking-tight">Evaluations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A small, hand-authored eval set that captures the failure modes we care about.
          This is the bar we&apos;d hold the production agent to.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={EVALUATIONS.length} />
        <StatCard label="Passing" value={passing} tone="success" />
        <StatCard label="Failing" value={EVALUATIONS.length - passing} tone="danger" />
        <StatCard label="Guardrails verified" value={EVALUATIONS.filter((e) => e.guardrail).length} tone="info" />
      </div>

      <div className="mt-8 space-y-6">
        {EVALUATIONS.map((e) => {
          const cat = CATEGORY_BADGE[e.category];
          const CatIcon = cat.icon;
          return (
            <Card key={e.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ring-inset ${cat.tone}`}
                      >
                        <CatIcon className="h-3 w-3" />
                        {cat.label}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {e.id}
                      </Badge>
                    </div>
                    <CardTitle className="text-base">{e.title}</CardTitle>
                  </div>
                  <PassFailBadge pass={e.pass} />
                </div>
                <CardDescription className="pt-2">
                  <span className="font-medium text-foreground">What happened: </span>
                  {e.whatHappened}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <Section title="Input">
                  <pre className="rounded-md border border-border bg-muted/40 p-3 text-xs whitespace-pre-wrap">
                    {e.input}
                  </pre>
                </Section>

                <div className="grid gap-3 lg:grid-cols-2">
                  <OutputColumn
                    title="AI output"
                    rows={[
                      ["Request type", e.aiOutput.requestType],
                      ["Priority", e.aiOutput.priority],
                      ["Confidence", `${Math.round(e.aiOutput.confidence * 100)}%`],
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

                <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
                  <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Guardrail
                  </div>
                  <p>{e.guardrail}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function PassFailBadge({ pass }: { pass: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
        pass
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20"
          : "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20"
      }`}
    >
      {pass ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <XCircle className="h-3.5 w-3.5" />
      )}
      {pass ? "Pass" : "Fail"}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
    <div className="rounded-md border border-border bg-card p-3">
      <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-xs">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-2">
        <p className="text-xs font-medium text-muted-foreground">Key facts</p>
        <ul className="mt-1 text-xs">
          {facts.map((f, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-current opacity-60" />
              {f}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-2">
        <p className="text-xs font-medium text-muted-foreground">Actions chosen</p>
        <ul className="mt-1 text-xs">
          {actions.map((a, i) => (
            <li key={i}>· {a}</li>
          ))}
        </ul>
      </div>
      {draftSnippet ? (
        <div className="mt-2">
          <p className="text-xs font-medium text-muted-foreground">Draft snippet</p>
          <p className="mt-1 rounded border border-border bg-muted/40 p-2 text-xs italic">
            “{draftSnippet}”
          </p>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "default" | "success" | "danger" | "info";
}) {
  const toneClass = {
    default: "text-foreground",
    success: "text-emerald-600 dark:text-emerald-400",
    danger: "text-rose-600 dark:text-rose-400",
    info: "text-sky-600 dark:text-sky-400",
  }[tone ?? "default"];
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tracking-tight ${toneClass}`}>
        {value}
      </p>
    </div>
  );
}
