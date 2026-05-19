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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to dashboard
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {case_.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Case <code className="text-xs">{case_.id}</code>
          </p>
        </div>
        <CaseStatusButtons
          caseId={case_.id}
          currentStatus={case_.status as CaseStatus}
        />
      </div>

      <div className="mt-6">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="extracted">Extracted data</TabsTrigger>
            <TabsTrigger value="draft">Draft & metadata</TabsTrigger>
            <TabsTrigger value="actions">
              Actions ({actions.length})
            </TabsTrigger>
            <TabsTrigger value="tasks">
              Tasks ({case_.tasks.length})
            </TabsTrigger>
            <TabsTrigger value="timeline">
              Timeline ({case_.activity.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <CaseOverview case_={case_} analysis={analysis} />
            {analysis?.internalNotes ? (
              <div className="mt-4 rounded-lg border border-dashed border-border bg-card p-4">
                <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Internal notes
                </h3>
                <p className="mt-1 text-sm">{analysis.internalNotes}</p>
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="extracted" className="mt-4">
            <CaseExtracted data={analysis?.extractedData ?? null} />
          </TabsContent>

          <TabsContent value="draft" className="mt-4 space-y-4">
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

          <TabsContent value="actions" className="mt-4">
            <CaseActionsPanel caseId={case_.id} actions={actions} />
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            <CaseTasks caseId={case_.id} tasks={case_.tasks} />
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <CaseTimeline events={case_.activity} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
