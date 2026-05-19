import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/case-state";
import { regenerateDraft } from "@/lib/ai/regenerate-draft";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_req: Request, context: RouteContext) {
  const { id } = await context.params;

  const case_ = await db.case.findUnique({
    where: { id },
    include: { analysis: true },
  });
  if (!case_) {
    return NextResponse.json({ error: "Case not found." }, { status: 404 });
  }
  if (!case_.analysis) {
    return NextResponse.json(
      { error: "Case has no analysis yet — run full analysis first." },
      { status: 400 },
    );
  }

  const outcome = await regenerateDraft({
    rawInput: case_.rawInput,
    customerName: case_.customerName,
    customerEmail: case_.customerEmail,
    summary: case_.analysis.summary,
    requestType: case_.requestType,
    assignedTeam: case_.assignedTeam,
    needsHumanReview: case_.needsHumanReview,
    previousDraft: case_.analysis.draftResponse,
  });

  await db.caseAnalysis.update({
    where: { caseId: id },
    data: {
      draftResponse: outcome.draftResponse,
      internalNotes: outcome.internalNotes,
    },
  });

  await logActivity(
    id,
    "draft_regenerated",
    `Draft response regenerated via ${outcome.source} pipeline.`,
    { source: outcome.source },
  );

  return NextResponse.json({
    ok: true,
    source: outcome.source,
    draftResponse: outcome.draftResponse,
  });
}
