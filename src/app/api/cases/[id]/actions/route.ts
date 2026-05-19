import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/case-state";

export const runtime = "nodejs";

const bodySchema = z.object({
  actionId: z.string(),
  decision: z.enum(["approve", "reject"]),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, context: RouteContext) {
  const { id } = await context.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const action = await db.mockIntegrationAction.findUnique({
    where: { id: parsed.data.actionId },
  });
  if (!action || action.caseId !== id) {
    return NextResponse.json({ error: "Action not found" }, { status: 404 });
  }
  if (action.status !== "PENDING") {
    return NextResponse.json(
      { error: `Action is already ${action.status}` },
      { status: 400 },
    );
  }

  const newStatus = parsed.data.decision === "approve" ? "COMPLETED" : "FAILED";
  await db.mockIntegrationAction.update({
    where: { id: action.id },
    data: { status: newStatus },
  });
  await logActivity(
    id,
    "tool_decision",
    `Action ${action.toolName ?? action.actionType} ${
      parsed.data.decision === "approve" ? "approved" : "rejected"
    } by human.`,
    { actionId: action.id, toolName: action.toolName },
  );

  return NextResponse.json({ ok: true, status: newStatus });
}
