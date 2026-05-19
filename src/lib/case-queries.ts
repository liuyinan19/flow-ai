import { db } from "@/lib/db";
import {
  type CaseStatus,
  type Priority,
  type RequestType,
} from "@/lib/types";

export interface CaseFilter {
  status?: CaseStatus;
  priority?: Priority;
  requestType?: RequestType;
  needsReviewOnly?: boolean;
}

export async function listCases(filter: CaseFilter = {}, limit = 50) {
  const where: Record<string, unknown> = {};
  if (filter.status) where.status = filter.status;
  if (filter.priority) where.priority = filter.priority;
  if (filter.requestType) where.requestType = filter.requestType;
  if (filter.needsReviewOnly) where.needsHumanReview = true;

  return db.case.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getDashboardMetrics() {
  const [
    total,
    newCount,
    inProgress,
    needsReview,
    completed,
    urgent,
    avgRow,
    byType,
    byStatus,
    byPriority,
  ] = await Promise.all([
    db.case.count(),
    db.case.count({ where: { status: "NEW" } }),
    db.case.count({ where: { status: "IN_PROGRESS" } }),
    db.case.count({ where: { status: "NEEDS_REVIEW" } }),
    db.case.count({ where: { status: "COMPLETED" } }),
    db.case.count({ where: { priority: "URGENT" } }),
    db.case.aggregate({ _avg: { confidence: true } }),
    db.case.groupBy({ by: ["requestType"], _count: { _all: true } }),
    db.case.groupBy({ by: ["status"], _count: { _all: true } }),
    db.case.groupBy({ by: ["priority"], _count: { _all: true } }),
  ]);

  return {
    total,
    newCount,
    inProgress,
    needsReview,
    completed,
    urgent,
    avgConfidence: avgRow._avg.confidence,
    byType,
    byStatus,
    byPriority,
  };
}
