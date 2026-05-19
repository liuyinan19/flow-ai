import { NextResponse } from "next/server";
import { z } from "zod";
import { createAndAnalyzeCase } from "@/lib/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  rawInput: z.string().min(10, "Please paste at least a sentence."),
  customerName: z.string().optional().nullable(),
  customerEmail: z.string().email().optional().nullable().or(z.literal("")),
  inputType: z
    .enum(["TEXT", "FORM", "FILE", "SCREENSHOT", "VOICE"])
    .optional(),
  businessCategory: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await createAndAnalyzeCase({
    rawInput: parsed.data.rawInput,
    customerName: parsed.data.customerName || null,
    customerEmail: parsed.data.customerEmail || null,
    inputType: parsed.data.inputType,
    businessCategory: parsed.data.businessCategory ?? null,
  });

  return NextResponse.json({
    caseId: result.caseId,
    source: result.outcome.source,
    guardrailReasons: result.outcome.guardrailReasons,
  });
}
