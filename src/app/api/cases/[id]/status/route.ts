import { NextResponse } from "next/server";
import { z } from "zod";
import { transitionCase } from "@/lib/case-state";
import { STATUSES } from "@/lib/types";

export const runtime = "nodejs";

const bodySchema = z.object({
  status: z.enum(STATUSES as [string, ...string[]]),
  message: z.string().optional(),
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
      { error: "Invalid status request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await transitionCase(id, parsed.data.status as never, {
    message: parsed.data.message,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
