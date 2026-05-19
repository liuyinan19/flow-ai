import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/case-state";

export const runtime = "nodejs";

const taskUpdateSchema = z.object({
  taskId: z.string(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
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
  const parsed = taskUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const task = await db.task.findUnique({ where: { id: parsed.data.taskId } });
  if (!task || task.caseId !== id) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  await db.task.update({
    where: { id: task.id },
    data: { status: parsed.data.status },
  });
  await logActivity(
    id,
    "task_update",
    `Task "${task.title}" → ${parsed.data.status}.`,
    { taskId: task.id, status: parsed.data.status },
  );

  return NextResponse.json({ ok: true });
}
