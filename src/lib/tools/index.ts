import { db } from "@/lib/db";
import { logActivity } from "@/lib/case-state";
import type {
  ActionStatus,
  ActionType,
  RecommendedAction,
  ToolName,
} from "@/lib/types";

interface ToolContext {
  caseId: string;
  assignedTeam: string;
  draftResponse: string;
  tasks: { title: string; description: string; ownerTeam: string }[];
}

interface ToolResult {
  toolName: ToolName;
  actionType: ActionType;
  status: ActionStatus;
  payload: Record<string, unknown>;
}

export async function executeRecommendedAction(
  action: RecommendedAction,
  context: ToolContext,
): Promise<ToolResult> {
  switch (action.tool) {
    case "createInternalTask":
      return await runCreateInternalTask(action, context);
    case "routeCase":
      return await runRouteCase(action, context);
    case "draftCustomerEmail":
      return await runDraftCustomerEmail(action, context);
    case "createCalendarFollowUp":
      return await runCreateCalendarFollowUp(action, context);
    case "sendToHumanReview":
      return await runSendToHumanReview(action, context);
    default:
      return {
        toolName: action.tool,
        actionType: "ROUTE_CASE",
        status: "FAILED",
        payload: { error: `Unknown tool: ${action.tool as string}` },
      };
  }
}

async function runCreateInternalTask(
  action: RecommendedAction,
  context: ToolContext,
): Promise<ToolResult> {
  if (action.requiresApproval) {
    return {
      toolName: "createInternalTask",
      actionType: "CREATE_TASK",
      status: "PENDING",
      payload: { reason: action.reason, action: action.action },
    };
  }

  await logActivity(
    context.caseId,
    "tool_call",
    `Tool createInternalTask executed: ${action.action}`,
    { reason: action.reason },
  );

  return {
    toolName: "createInternalTask",
    actionType: "CREATE_TASK",
    status: "COMPLETED",
    payload: {
      note: "Internal tasks for this case were created from analysis output.",
      taskCount: context.tasks.length,
    },
  };
}

async function runRouteCase(
  action: RecommendedAction,
  context: ToolContext,
): Promise<ToolResult> {
  if (action.requiresApproval) {
    return {
      toolName: "routeCase",
      actionType: "ROUTE_CASE",
      status: "PENDING",
      payload: { team: context.assignedTeam, reason: action.reason },
    };
  }

  await db.case.update({
    where: { id: context.caseId },
    data: { assignedTeam: context.assignedTeam },
  });
  await logActivity(
    context.caseId,
    "tool_call",
    `Tool routeCase executed: routed to ${context.assignedTeam}.`,
    { team: context.assignedTeam },
  );

  return {
    toolName: "routeCase",
    actionType: "ROUTE_CASE",
    status: "COMPLETED",
    payload: { team: context.assignedTeam, reason: action.reason },
  };
}

async function runDraftCustomerEmail(
  action: RecommendedAction,
  context: ToolContext,
): Promise<ToolResult> {
  if (action.requiresApproval) {
    return {
      toolName: "draftCustomerEmail",
      actionType: "SEND_EMAIL",
      status: "PENDING",
      payload: {
        draft: context.draftResponse,
        reason: action.reason,
        note: "Draft stored — awaiting human approval before sending.",
      },
    };
  }

  await logActivity(
    context.caseId,
    "tool_call",
    `Tool draftCustomerEmail executed: draft stored.`,
    { length: context.draftResponse.length },
  );

  return {
    toolName: "draftCustomerEmail",
    actionType: "SEND_EMAIL",
    status: "COMPLETED",
    payload: { draft: context.draftResponse, reason: action.reason },
  };
}

async function runCreateCalendarFollowUp(
  action: RecommendedAction,
  context: ToolContext,
): Promise<ToolResult> {
  const dueDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2); // +2 days

  if (action.requiresApproval) {
    return {
      toolName: "createCalendarFollowUp",
      actionType: "CREATE_CALENDAR_EVENT",
      status: "PENDING",
      payload: {
        reason: action.reason,
        suggestedDate: dueDate.toISOString(),
      },
    };
  }

  await logActivity(
    context.caseId,
    "tool_call",
    `Tool createCalendarFollowUp executed: follow-up scheduled.`,
    { suggestedDate: dueDate.toISOString() },
  );

  return {
    toolName: "createCalendarFollowUp",
    actionType: "CREATE_CALENDAR_EVENT",
    status: "COMPLETED",
    payload: {
      title: `Follow up on case`,
      suggestedDate: dueDate.toISOString(),
      reason: action.reason,
    },
  };
}

async function runSendToHumanReview(
  action: RecommendedAction,
  context: ToolContext,
): Promise<ToolResult> {
  await db.case.update({
    where: { id: context.caseId },
    data: { needsHumanReview: true, status: "NEEDS_REVIEW" },
  });
  await logActivity(
    context.caseId,
    "tool_call",
    `Tool sendToHumanReview executed: case escalated.`,
    { reason: action.reason },
  );

  return {
    toolName: "sendToHumanReview",
    actionType: "ROUTE_CASE",
    status: "COMPLETED",
    payload: { reason: action.reason },
  };
}
