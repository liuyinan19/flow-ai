"use client";

import { useState } from "react";
import { Play, Loader2, CheckCircle2, XCircle, Gauge } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EvalCheck {
  field: string;
  expected: string;
  actual: string;
  passed: boolean;
}

interface EvalLiveResult {
  id: string;
  title: string;
  source: "anthropic" | "mock" | "fallback";
  latencyMs: number;
  checks: EvalCheck[];
  passed: boolean;
  guardrailReasons: string[];
  actualNeedsHumanReview: boolean;
  actualConfidence: number;
  actualRequestType: string;
  actualPriority: string;
  actualDraftSnippet: string;
  actualKeyFacts: string[];
  actualActions: string[];
}

interface RunResponse {
  runAt: string;
  source: string;
  results: EvalLiveResult[];
}

export function EvaluationsRunner() {
  const [running, setRunning] = useState(false);
  const [response, setResponse] = useState<RunResponse | null>(null);

  const run = async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/evaluations/run", { method: "POST" });
      const json = (await res.json()) as RunResponse | { error: string };
      if (!res.ok || "error" in json) {
        throw new Error("error" in json ? json.error : "Eval run failed.");
      }
      setResponse(json);
      const passed = json.results.filter((r) => r.passed).length;
      toast.success(
        `Live eval complete — ${passed}/${json.results.length} passed (source: ${json.source}).`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Eval run failed.");
    } finally {
      setRunning(false);
    }
  };

  const passing = response?.results.filter((r) => r.passed).length ?? 0;
  const totalLatency = response
    ? response.results.reduce((acc, r) => acc + r.latencyMs, 0)
    : 0;

  return (
    <div className="card-glass grain p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-body-lg font-semibold tracking-tight">
            Run evals against the live model
          </h3>
          <p className="mt-1 text-caption text-[rgba(var(--text)/0.65)]">
            Feeds each fixture through the actual pipeline (real Claude when{" "}
            <code className="rounded bg-[rgba(var(--text)/0.06)] px-1">
              ANTHROPIC_API_KEY
            </code>{" "}
            is set, otherwise the heuristic mock) and asserts request type +
            review flag + tool set.
          </p>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={running}
          className={cn(
            "focus-ring pressable inline-flex h-10 items-center gap-1.5 rounded-full px-5 text-sm font-semibold",
            "bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent2))] text-white",
            "shadow-[0_8px_24px_-8px_rgba(168,162,255,0.55)]",
            running && "cursor-not-allowed opacity-70",
          )}
        >
          {running ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {running ? "Running…" : "Run live"}
        </button>
      </div>

      {response ? (
        <div className="mt-5 space-y-4">
          <div className="grid gap-2 sm:grid-cols-4">
            <Tile label="Source" value={response.source} tone="info" />
            <Tile
              label="Passed"
              value={`${passing}/${response.results.length}`}
              tone={passing === response.results.length ? "good" : "bad"}
            />
            <Tile
              label="Total latency"
              value={`${totalLatency}ms`}
              tone="info"
              icon={<Gauge className="h-3.5 w-3.5" />}
            />
            <Tile
              label="Run at"
              value={new Date(response.runAt).toLocaleTimeString()}
              tone="info"
            />
          </div>

          <ul className="space-y-3">
            {response.results.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-[rgba(var(--text)/0.06)] bg-[rgba(var(--text)/0.03)] p-4"
              >
                <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      {r.passed ? (
                        <span className="status-completed">
                          <CheckCircle2 className="h-3 w-3" />
                          live pass
                        </span>
                      ) : (
                        <span className="status-review">
                          <XCircle className="h-3 w-3" />
                          live fail
                        </span>
                      )}
                      <code className="rounded bg-[rgba(var(--text)/0.06)] px-1.5 py-0.5 text-[10px] text-[rgba(var(--text)/0.65)]">
                        {r.id}
                      </code>
                    </div>
                    <p className="mt-1 text-body-sm font-medium">{r.title}</p>
                  </div>
                  <div className="text-right text-caption text-[rgba(var(--text)/0.6)]">
                    <p>{r.latencyMs} ms</p>
                    <p>conf {Math.round(r.actualConfidence * 100)}%</p>
                  </div>
                </div>

                <ul className="space-y-1 text-caption">
                  {r.checks.map((c) => (
                    <li key={c.field} className="flex items-start gap-2">
                      <span
                        className={cn(
                          "mt-0.5 inline-grid h-4 w-4 place-items-center rounded-full text-[10px]",
                          c.passed
                            ? "bg-[rgb(var(--green))]/15 text-[rgb(var(--green))]"
                            : "bg-[rgb(var(--red))]/15 text-[rgb(var(--red))]",
                        )}
                      >
                        {c.passed ? "✓" : "✗"}
                      </span>
                      <span>
                        <span className="font-medium">{c.field}:</span>{" "}
                        <code className="rounded bg-[rgba(var(--text)/0.04)] px-1 text-[10px]">
                          {c.actual}
                        </code>{" "}
                        <span className="text-[rgba(var(--text)/0.55)]">
                          (expected{" "}
                          <code className="rounded bg-[rgba(var(--text)/0.04)] px-1 text-[10px]">
                            {c.expected}
                          </code>
                          )
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>

                {r.guardrailReasons.length > 0 ? (
                  <p className="mt-2 text-[11px] text-[rgba(var(--text)/0.55)]">
                    <span className="font-semibold text-[rgb(var(--accent))]">
                      Guardrails fired:
                    </span>{" "}
                    {r.guardrailReasons.join(" · ")}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-caption text-[rgba(var(--text)/0.55)]">
          Click <span className="font-semibold">Run live</span> to fire every
          fixture through the live pipeline. Each fixture takes 1–4s with real
          Claude.
        </p>
      )}
    </div>
  );
}

function Tile({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone: "info" | "good" | "bad";
  icon?: React.ReactNode;
}) {
  const toneClass = {
    info: "text-[rgb(var(--text))]",
    good: "text-[rgb(var(--green))]",
    bad: "text-[rgb(var(--red))]",
  }[tone];
  return (
    <div className="rounded-2xl border border-[rgba(var(--text)/0.06)] bg-[rgba(var(--text)/0.03)] p-3">
      <div className="flex items-center justify-between text-overline uppercase tracking-wide text-[rgba(var(--text)/0.55)]">
        {label}
        {icon}
      </div>
      <p className={cn("mt-1 text-body-lg font-semibold tabular-nums", toneClass)}>
        {value}
      </p>
    </div>
  );
}
