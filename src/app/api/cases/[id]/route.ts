import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/case-state";
import { PRIORITIES, REQUEST_TYPES } from "@/lib/types";

export const runtime = "nodejs";

const patchSchema = z.object({
  requestType: z.enum(REQUEST_TYPES as [string, ...string[]]).optional(),
  priority: z.enum(PRIORITIES as [string, ...string[]]).optional(),
  assignedTeam: z.string().optional(),
  draftResponse: z.string().optional(),
  internalNotes: z.string().optional(),
  extractedData: z.record(z.string(), z.unknown()).optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, context: RouteContext) {
  const { id } = await context.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid patch", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const editedFields: string[] = [];
  const caseUpdate: Record<string, unknown> = {};
  if (parsed.data.requestType) {
    caseUpdate.requestType = parsed.data.requestType;
    editedFields.push("requestType");
  }
  if (parsed.data.priority) {
    caseUpdate.priority = parsed.data.priority;
    editedFields.push("priority");
  }
  if (typeof parsed.data.assignedTeam === "string") {
    caseUpdate.assignedTeam = parsed.data.assignedTeam;
    editedFields.push("assignedTeam");
  }

  if (Object.keys(caseUpdate).length > 0) {
    await db.case.update({ where: { id }, data: caseUpdate });
  }

  const analysisUpdate: Record<string, unknown> = {};
  if (typeof parsed.data.draftResponse === "string") {
    analysisUpdate.draftResponse = parsed.data.draftResponse;
    editedFields.push("draftResponse");
  }
  if (typeof parsed.data.internalNotes === "string") {
    analysisUpdate.internalNotes = parsed.data.internalNotes;
    editedFields.push("internalNotes");
  }
  if (parsed.data.extractedData) {
    analysisUpdate.extractedData = JSON.stringify(parsed.data.extractedData);
    editedFields.push("extractedData");
  }

  if (Object.keys(analysisUpdate).length > 0) {
    await db.caseAnalysis.update({
      where: { caseId: id },
      data: analysisUpdate,
    });
  }

  if (editedFields.length > 0) {
    await logActivity(
      id,
      "human_edit",
      `Human edited: ${editedFields.join(", ")}.`,
      { fields: editedFields },
    );
  }

  return NextResponse.json({ ok: true, editedFields });
}
