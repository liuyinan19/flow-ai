import { db } from "@/lib/db";
import { runAnalysis } from "@/lib/ai/analyze";
import { executeRecommendedAction } from "@/lib/tools";
import { logActivity } from "@/lib/case-state";
import type { AnalyzeInput } from "@/lib/ai/prompt";
import type {
  CaseAnalysisResult,
  CaseStatus,
  InputType,
} from "@/lib/types";

export interface CreateAndAnalyzeInput extends AnalyzeInput {
  inputType?: InputType;
}

export async function createAndAnalyzeCase(input: CreateAndAnalyzeInput) {
  const created = await db.case.create({
    data: {
      title: "Analyzing…",
      customerName: input.customerName ?? null,
      customerEmail: input.customerEmail ?? null,
      rawInput: input.rawInput,
      inputType: input.inputType ?? "TEXT",
      status: "NEW",
    },
  });

  await logActivity(created.id, "case_created", "Case received from intake.");

  const outcome = await runAnalysis(input);
  await persistAnalysis(created.id, outcome.analysis, outcome.source);
  await runToolCallsForCase(created.id, outcome.analysis);

  return { caseId: created.id, outcome };
}

export async function regenerateAnalysisForCase(
  caseId: string,
  input: AnalyzeInput,
) {
  const outcome = await runAnalysis(input);

  // Wipe prior derived state (analysis, tool actions, tasks from previous run)
  await db.$transaction([
    db.caseAnalysis.deleteMany({ where: { caseId } }),
    db.mockIntegrationAction.deleteMany({ where: { caseId } }),
    db.task.deleteMany({ where: { caseId } }),
  ]);

  await persistAnalysis(caseId, outcome.analysis, outcome.source);
  await runToolCallsForCase(caseId, outcome.analysis);
  await logActivity(
    caseId,
    "analysis_regenerated",
    `Analysis re-run via ${outcome.source} pipeline.`,
  );

  return outcome;
}

async function persistAnalysis(
  caseId: string,
  analysis: CaseAnalysisResult,
  source: string,
) {
  const targetStatus: CaseStatus = analysis.needsHumanReview
    ? "NEEDS_REVIEW"
    : "ANALYZED";

  await db.$transaction([
    db.case.update({
      where: { id: caseId },
      data: {
        title: analysis.title,
        requestType: analysis.requestType,
        priority: analysis.priority,
        confidence: analysis.confidence,
        needsHumanReview: analysis.needsHumanReview,
        assignedTeam: analysis.assignedTeam,
        status: targetStatus,
      },
    }),
    db.caseAnalysis.create({
      data: {
        caseId,
        summary: analysis.summary,
        classificationReason: analysis.classificationReason,
        extractedData: JSON.stringify(analysis.extractedData),
        riskFlags: JSON.stringify(analysis.riskFlags),
        recommendedActions: JSON.stringify(analysis.recommendedActions),
        draftResponse: analysis.draftResponse,
        internalNotes: analysis.internalNotes,
      },
    }),
    db.task.createMany({
      data: analysis.tasks.map((task) => ({
        caseId,
        title: task.title,
        description: task.description,
        ownerTeam: task.ownerTeam,
      })),
    }),
    db.activityLog.create({
      data: {
        caseId,
        eventType: "analysis_completed",
        message: `AI analysis completed (source: ${source}, confidence ${analysis.confidence.toFixed(
          2,
        )}).`,
        metadata: JSON.stringify({
          source,
          confidence: analysis.confidence,
          needsHumanReview: analysis.needsHumanReview,
        }),
      },
    }),
    db.activityLog.create({
      data: {
        caseId,
        eventType: "status_change",
        message: `Status set to ${targetStatus} after analysis.`,
        metadata: JSON.stringify({ to: targetStatus }),
      },
    }),
  ]);
}

async function runToolCallsForCase(
  caseId: string,
  analysis: CaseAnalysisResult,
) {
  const context = {
    caseId,
    assignedTeam: analysis.assignedTeam,
    draftResponse: analysis.draftResponse,
    tasks: analysis.tasks,
  };

  for (const action of analysis.recommendedActions) {
    const result = await executeRecommendedAction(action, context);
    await db.mockIntegrationAction.create({
      data: {
        caseId,
        actionType: result.actionType,
        status: result.status,
        payload: JSON.stringify(result.payload),
        reason: action.reason,
        toolName: action.tool,
      },
    });
  }
}
