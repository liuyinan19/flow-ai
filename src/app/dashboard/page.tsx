import Link from "next/link";
import {
  Inbox,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Plus,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { GlassCard } from "@/components/glass-card";
import { BreakdownCard } from "@/components/breakdown-card";
import { CaseTable } from "@/components/case-table";
import { CaseFilters } from "@/components/case-filters";
import { DemoButton } from "@/components/demo-button";
import { PageHeader } from "@/components/page-header";
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
    status:
      typeof params.status === "string"
        ? (params.status as CaseStatus)
        : undefined,
    priority:
      typeof params.priority === "string"
        ? (params.priority as Priority)
        : undefined,
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
    <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
      <PageHeader
        title="Operations Dashboard"
        subtitle="All inbound cases the AI Operations Agent has triaged."
        actions={
          <>
            <DemoButton size="sm" />
            <Link
              href="/cases/new"
              className="focus-ring pressable inline-flex h-9 items-center gap-1.5 rounded-full border border-[rgba(var(--text)/0.12)] bg-[rgba(var(--text)/0.04)] px-4 text-sm font-semibold backdrop-blur hover:bg-[rgba(var(--text)/0.08)]"
            >
              <Plus className="h-3.5 w-3.5" />
              New case
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total cases"
          value={metrics.total}
          hint={`${metrics.newCount} new`}
          icon={<Inbox className="h-3.5 w-3.5" />}
          tone="purple"
        />
        <StatCard
          label="Needs review"
          value={metrics.needsReview}
          hint={metrics.needsReview > 0 ? "Held for a human" : "All clear"}
          icon={<ShieldAlert className="h-3.5 w-3.5" />}
          tone="yellow"
        />
        <StatCard
          label="Urgent"
          value={metrics.urgent}
          hint="Highest priority bucket"
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
          tone="dark"
        />
        <StatCard
          label="Completed"
          value={metrics.completed}
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          tone="dark"
        />
        <StatCard
          label="Avg confidence"
          value={avgConfPct}
          hint="Across analyzed cases"
          icon={<Gauge className="h-3.5 w-3.5" />}
          tone="dark"
        />
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        <BreakdownCard title="By request type" items={typeCounts} />
        <BreakdownCard title="By status" items={statusCounts} />
        <BreakdownCard title="By priority" items={priorityCounts} />
      </div>

      <GlassCard className="mt-8" padded>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-heading-3 font-semibold tracking-tight">
            Recent cases
          </h2>
          <CaseFilters />
        </div>
        <CaseTable cases={cases} />
      </GlassCard>
    </div>
  );
}
