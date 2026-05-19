import Link from "next/link";
import {
  Inbox,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Gauge,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MetricCard } from "@/components/metric-card";
import { BreakdownCard } from "@/components/breakdown-card";
import { CaseTable } from "@/components/case-table";
import { CaseFilters } from "@/components/case-filters";
import { DemoButton } from "@/components/demo-button";
import { getDashboardMetrics, listCases } from "@/lib/case-queries";
import {
  PRIORITIES,
  REQUEST_TYPES,
  STATUSES,
  type CaseStatus,
  type Priority,
  type RequestType,
} from "@/lib/types";

export const dynamic = "force-dynamic";

interface DashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const filter = {
    status: typeof params.status === "string" ? (params.status as CaseStatus) : undefined,
    priority: typeof params.priority === "string" ? (params.priority as Priority) : undefined,
    requestType:
      typeof params.requestType === "string"
        ? (params.requestType as RequestType)
        : undefined,
    needsReviewOnly: params.needsReview === "1",
  };

  const [metrics, cases] = await Promise.all([
    getDashboardMetrics(),
    listCases(filter),
  ]);

  const typeCounts = REQUEST_TYPES.map((t) => ({
    label: t,
    count: metrics.byType.find((b) => b.requestType === t)?._count._all ?? 0,
  }));
  const statusCounts = STATUSES.map((s) => ({
    label: s,
    count: metrics.byStatus.find((b) => b.status === s)?._count._all ?? 0,
  }));
  const priorityCounts = PRIORITIES.map((p) => ({
    label: p,
    count: metrics.byPriority.find((b) => b.priority === p)?._count._all ?? 0,
  }));

  const avgConfPct =
    metrics.avgConfidence == null
      ? "—"
      : `${Math.round(metrics.avgConfidence * 100)}%`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Operations Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All inbound cases the AI Operations Agent has triaged.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DemoButton variant="default" size="sm" />
          <Link
            href="/cases/new"
            className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
          >
            New case
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          label="Total cases"
          value={metrics.total}
          icon={Inbox}
          hint={`${metrics.newCount} new`}
        />
        <MetricCard
          label="Needs review"
          value={metrics.needsReview}
          icon={ShieldAlert}
          tone={metrics.needsReview > 0 ? "danger" : "default"}
        />
        <MetricCard
          label="Urgent cases"
          value={metrics.urgent}
          icon={AlertTriangle}
          tone={metrics.urgent > 0 ? "warning" : "default"}
        />
        <MetricCard
          label="Completed"
          value={metrics.completed}
          icon={CheckCircle2}
          tone="success"
        />
        <MetricCard
          label="Avg confidence"
          value={avgConfPct}
          icon={Gauge}
          hint="Across all analyzed cases"
        />
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        <BreakdownCard title="By request type" items={typeCounts} />
        <BreakdownCard title="By status" items={statusCounts} />
        <BreakdownCard title="By priority" items={priorityCounts} />
      </div>

      <div className="mt-8 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Recent cases</h2>
          <CaseFilters />
        </div>
        <CaseTable cases={cases} />
      </div>
    </div>
  );
}
