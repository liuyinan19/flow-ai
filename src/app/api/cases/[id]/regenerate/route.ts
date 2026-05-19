import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { regenerateAnalysisForCase } from "@/lib/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const existing = await db.case.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  const outcome = await regenerateAnalysisForCase(id, {
    rawInput: existing.rawInput,
    customerName: existing.customerName,
    customerEmail: existing.customerEmail,
    inputType: existing.inputType,
  });

  return NextResponse.json({
    ok: true,
    source: outcome.source,
    guardrailReasons: outcome.guardrailReasons,
    draftResponse: outcome.analysis.draftResponse,
  });
}
