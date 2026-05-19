// Domain types — kept as string-literal unions so they can be shared across
// server + client without depending on Prisma's generated enums (which we
// represent as strings on SQLite).

export type CaseStatus =
  | "NEW"
  | "ANALYZED"
  | "IN_PROGRESS"
  | "NEEDS_REVIEW"
  | "COMPLETED";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type InputType = "TEXT" | "FORM" | "FILE" | "SCREENSHOT" | "VOICE";

export type RequestType =
  | "SUPPORT"
  | "SALES"
  | "BILLING"
  | "LEGAL"
  | "OPERATIONS"
  | "HR"
  | "OTHER";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type ActionType =
  | "SEND_EMAIL"
  | "CREATE_CALENDAR_EVENT"
  | "CREATE_TASK"
  | "ROUTE_CASE";

export type ActionStatus = "PENDING" | "COMPLETED" | "FAILED";

export type RiskSeverity = "LOW" | "MEDIUM" | "HIGH";

export interface ExtractedData {
  customerIntent: string;
  keyFacts: string[];
  entities: Record<string, string>;
  deadlines: string[];
  moneyAmounts: string[];
  contactInfo: Record<string, string>;
  missingInformation: string[];
}

export interface RiskFlag {
  type: string;
  severity: RiskSeverity;
  reason: string;
}

export interface RecommendedAction {
  action: string;
  tool: ToolName;
  reason: string;
  requiresApproval: boolean;
}

export interface AnalysisTask {
  title: string;
  description: string;
  ownerTeam: string;
}

export type ToolName =
  | "createInternalTask"
  | "routeCase"
  | "draftCustomerEmail"
  | "createCalendarFollowUp"
  | "sendToHumanReview";

export interface CaseAnalysisResult {
  title: string;
  summary: string;
  requestType: RequestType;
  priority: Priority;
  confidence: number;
  needsHumanReview: boolean;
  assignedTeam: string;
  classificationReason: string;
  extractedData: ExtractedData;
  riskFlags: RiskFlag[];
  recommendedActions: RecommendedAction[];
  tasks: AnalysisTask[];
  draftResponse: string;
  internalNotes: string;
}

export const REQUEST_TYPES: RequestType[] = [
  "SUPPORT",
  "SALES",
  "BILLING",
  "LEGAL",
  "OPERATIONS",
  "HR",
  "OTHER",
];

export const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export const STATUSES: CaseStatus[] = [
  "NEW",
  "ANALYZED",
  "IN_PROGRESS",
  "NEEDS_REVIEW",
  "COMPLETED",
];

export const INPUT_TYPES: InputType[] = [
  "TEXT",
  "FORM",
  "FILE",
  "SCREENSHOT",
  "VOICE",
];

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
