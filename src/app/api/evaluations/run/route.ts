import { NextResponse } from "next/server";
import { z } from "zod";
import { runAnalysis } from "@/lib/ai/analyze";
import { EVALUATIONS } from "@/data/evaluations";
import type { CaseAnalysisResult } from "@/lib/types";
import {
  clientIp,
  DEFAULT_LIMITS,
  makeRateLimitResponse,
  rateLimit,
} from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  id: z.string().optional(),
});

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

function summarizeActions(analysis: CaseAnalysisResult): string[] {
  return analysis.recommendedActions.map((a) => {
    if (a.tool === "routeCase") return `routeCase → ${analysis.assignedTeam}`;
    return a.tool;
  });
}

function runChecks(
  expected: (typeof EVALUATIONS)[number]["expected"],
  analysis: CaseAnalysisResult,
): EvalCheck[] {
  const checks: EvalCheck[] = [];

  checks.push({
    field: "requestType",
    expected: expected.requestType,
    actual: analysis.requestType,
    passed: analysis.requestType === expected.requestType,
  });

  checks.push({
    field: "needsHumanReview",
    expected: expected.needsHumanReview ? "true" : "false",
    actual: analysis.needsHumanReview ? "true" : "false",
    passed: analysis.needsHumanReview === expected.needsHumanReview,
  });

  // Tools chosen — match by tool name set, regardless of order.
  const actualTools = new Set(
    analysis.recommendedActions.map((a) => a.tool as string),
  );
  const expectedTools = new Set(
    expected.actionsChosen.map((s) => s.split(/[ →]/)[0]),
  );
  const toolOverlap = [...expectedTools].filter((t) => actualTools.has(t));
  checks.push({
    field: "tools",
    expected: [...expectedTools].sort().join(", "),
    actual: [...actualTools].sort().join(", "),
    passed: toolOverlap.length === expectedTools.size,
  });

  return checks;
}

export async function POST(req: Request) {
  const limit = rateLimit(
    `evaluations:${clientIp(req)}`,
    DEFAULT_LIMITS.evaluations,
  );
  if (!limit.allowed) return makeRateLimitResponse(limit.retryAfterSec);

  let body: { id?: string } = {};
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (parsed.success) body = parsed.data;
  } catch {
    // empty body → run all
  }

  const fixtures = body.id
    ? EVALUATIONS.filter((e) => e.id === body.id)
    : EVALUATIONS;

  if (fixtures.length === 0) {
    return NextResponse.json({ error: "No matching fixture." }, { status: 404 });
  }

  const results: EvalLiveResult[] = [];
  for (const fixture of fixtures) {
    const t0 = Date.now();
    const outcome = await runAnalysis({
      rawInput: fixture.input,
      inputType: "TEXT",
    });
    const latencyMs = Date.now() - t0;
    const checks = runChecks(fixture.expected, outcome.analysis);

    results.push({
      id: fixture.id,
      title: fixture.title,
      source: outcome.source,
      latencyMs,
      checks,
      passed: checks.every((c) => c.passed),
      guardrailReasons: outcome.guardrailReasons,
      actualNeedsHumanReview: outcome.analysis.needsHumanReview,
      actualConfidence: outcome.analysis.confidence,
      actualRequestType: outcome.analysis.requestType,
      actualPriority: outcome.analysis.priority,
      actualDraftSnippet: outcome.analysis.draftResponse.slice(0, 240),
      actualKeyFacts: outcome.analysis.extractedData.keyFacts.slice(0, 4),
      actualActions: summarizeActions(outcome.analysis),
    });
  }

  return NextResponse.json({
    runAt: new Date().toISOString(),
    source: results[0]?.source ?? "unknown",
    results,
  });
}
