import { db } from "@/lib/db";
import type { CaseStatus } from "@/lib/types";

const ALLOWED_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  NEW: ["ANALYZED", "NEEDS_REVIEW"],
  ANALYZED: ["IN_PROGRESS", "NEEDS_REVIEW", "COMPLETED"],
  IN_PROGRESS: ["COMPLETED", "NEEDS_REVIEW"],
  NEEDS_REVIEW: ["IN_PROGRESS", "COMPLETED", "ANALYZED"],
  COMPLETED: [],
};

export function canTransition(from: CaseStatus, to: CaseStatus): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export async function transitionCase(
  caseId: string,
  to: CaseStatus,
  options?: { message?: string; actor?: string },
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const existing = await db.case.findUnique({
    where: { id: caseId },
    select: { id: true, status: true, title: true },
  });
  if (!existing) return { ok: false, reason: "Case not found." };

  const from = existing.status as CaseStatus;
  if (!canTransition(from, to)) {
    return {
      ok: false,
      reason: `Status transition ${from} → ${to} is not allowed.`,
    };
  }

  await db.$transaction([
    db.case.update({
      where: { id: caseId },
      data: { status: to },
    }),
    db.activityLog.create({
      data: {
        caseId,
        eventType: "status_change",
        message:
          options?.message ?? `Status changed from ${from} to ${to}.`,
        metadata: JSON.stringify({ from, to, actor: options?.actor ?? "user" }),
      },
    }),
  ]);

  return { ok: true };
}

export async function logActivity(
  caseId: string,
  eventType: string,
  message: string,
  metadata?: Record<string, unknown>,
) {
  await db.activityLog.create({
    data: {
      caseId,
      eventType,
      message,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}
