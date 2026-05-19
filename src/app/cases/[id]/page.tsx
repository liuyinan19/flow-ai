import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CaseOverview } from "@/components/case-overview";
import { CaseExtracted } from "@/components/case-extracted";
import { CaseActionsPanel } from "@/components/case-actions-panel";
import { CaseTasks } from "@/components/case-tasks";
import { CaseTimeline } from "@/components/case-timeline";
import { CaseDraftEditor } from "@/components/case-draft-editor";
import { CaseStatusButtons } from "@/components/case-status-buttons";
import { CaseMetadataEditor } from "@/components/case-metadata-editor";
import { GlassCard } from "@/components/glass-card";
import {
  parseJson,
  type CaseStatus,
  type ExtractedData,
  type RecommendedAction,
  type RiskFlag,
} from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CaseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const case_ = await db.case.findUnique({
    where: { id },
    include: {
      analysis: true,
      tasks: { orderBy: { createdAt: "asc" } },
      actions: { orderBy: { createdAt: "asc" } },
      activity: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!case_) notFound();

  const analysis = case_.analysis
    ? {
        ...case_.analysis,
        extractedData: parseJson<ExtractedData>(case_.analysis.extractedData, {
          customerIntent: "",
          keyFacts: [],
          entities: {},
          deadlines: [],
          moneyAmounts: [],
          contactInfo: {},
          missingInformation: [],
        }),
        riskFlags: parseJson<RiskFlag[]>(case_.analysis.riskFlags, []),
        recommendedActions: parseJson<RecommendedAction[]>(
          case_.analysis.recommendedActions,
          [],
        ),
      }
    : null;

  const actions = case_.actions.map((a) => ({
    id: a.id,
    toolName: a.toolName,
    actionType: a.actionType,
    status: a.status,
    reason: a.reason,
    payload: parseJson<Record<string, unknown>>(a.payload, {}),
    createdAt: a.createdAt,
  }));

  return (
    <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-caption text-[rgba(var(--text)/0.6)] hover:text-[rgb(var(--text))]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to dashboard
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-heading-1 font-bold tracking-tight">{case_.title}</h1>
          <p className="mt-1 text-caption text-[rgba(var(--text)/0.55)]">
            Case <code className="rounded bg-[rgba(var(--text)/0.06)] px-1.5 py-0.5">{case_.id}</code>
          </p>
        </div>
        <CaseStatusButtons
          caseId={case_.id}
          currentStatus={case_.status as CaseStatus}
        />
      </div>

      <div className="mt-6">
        <Tabs defaultValue="overview">
          <TabsList className="rounded-full bg-[rgba(var(--text)/0.04)] p-1">
            <TabsTrigger value="overview" className="rounded-full px-4">
              Overview
            </TabsTrigger>
            <TabsTrigger value="extracted" className="rounded-full px-4">
              Extracted data
            </TabsTrigger>
            <TabsTrigger value="draft" className="rounded-full px-4">
              Draft &amp; metadata
            </TabsTrigger>
            <TabsTrigger value="actions" className="rounded-full px-4">
              Actions ({actions.length})
            </TabsTrigger>
            <TabsTrigger value="tasks" className="rounded-full px-4">
              Tasks ({case_.tasks.length})
            </TabsTrigger>
            <TabsTrigger value="timeline" className="rounded-full px-4">
              Timeline ({case_.activity.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-5">
            <CaseOverview case_={case_} analysis={analysis} />
            {analysis?.internalNotes ? (
              <GlassCard className="mt-4" padded>
                <h3 className="text-overline uppercase tracking-wide text-[rgba(var(--text)/0.55)]">
                  Internal notes
                </h3>
                <p className="mt-1 text-body-sm">{analysis.internalNotes}</p>
              </GlassCard>
            ) : null}
          </TabsContent>

          <TabsContent value="extracted" className="mt-5">
            <CaseExtracted data={analysis?.extractedData ?? null} />
          </TabsContent>

          <TabsContent value="draft" className="mt-5 space-y-4">
            <CaseMetadataEditor
              caseId={case_.id}
              requestType={case_.requestType}
              priority={case_.priority}
              assignedTeam={case_.assignedTeam}
            />
            <CaseDraftEditor
              caseId={case_.id}
              initialDraft={analysis?.draftResponse ?? ""}
            />
          </TabsContent>

          <TabsContent value="actions" className="mt-5">
            <CaseActionsPanel caseId={case_.id} actions={actions} />
          </TabsContent>

          <TabsContent value="tasks" className="mt-5">
            <CaseTasks caseId={case_.id} tasks={case_.tasks} />
          </TabsContent>

          <TabsContent value="timeline" className="mt-5">
            <CaseTimeline events={case_.activity} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
