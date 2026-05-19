import { z } from "zod";

const RequestTypeEnum = z.enum([
  "SUPPORT",
  "SALES",
  "BILLING",
  "LEGAL",
  "OPERATIONS",
  "HR",
  "OTHER",
]);

const PriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

const RiskSeverityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

const ToolNameEnum = z.enum([
  "createInternalTask",
  "routeCase",
  "draftCustomerEmail",
  "createCalendarFollowUp",
  "sendToHumanReview",
]);

export const extractedDataSchema = z.object({
  customerIntent: z.string(),
  keyFacts: z.array(z.string()).default([]),
  entities: z.record(z.string(), z.string()).default({}),
  deadlines: z.array(z.string()).default([]),
  moneyAmounts: z.array(z.string()).default([]),
  contactInfo: z.record(z.string(), z.string()).default({}),
  missingInformation: z.array(z.string()).default([]),
});

export const riskFlagSchema = z.object({
  type: z.string(),
  severity: RiskSeverityEnum,
  reason: z.string(),
});

export const recommendedActionSchema = z.object({
  action: z.string(),
  tool: ToolNameEnum,
  reason: z.string(),
  requiresApproval: z.boolean(),
});

export const analysisTaskSchema = z.object({
  title: z.string(),
  description: z.string(),
  ownerTeam: z.string(),
});

export const caseAnalysisSchema = z.object({
  title: z.string(),
  summary: z.string(),
  requestType: RequestTypeEnum,
  priority: PriorityEnum,
  confidence: z.number().min(0).max(1),
  needsHumanReview: z.boolean(),
  assignedTeam: z.string(),
  classificationReason: z.string(),
  extractedData: extractedDataSchema,
  riskFlags: z.array(riskFlagSchema).default([]),
  recommendedActions: z.array(recommendedActionSchema).default([]),
  tasks: z.array(analysisTaskSchema).default([]),
  draftResponse: z.string(),
  internalNotes: z.string(),
});

export type CaseAnalysisSchema = z.infer<typeof caseAnalysisSchema>;

// JSON Schema for Anthropic tool use — kept in sync with the Zod schema above.
export const caseAnalysisJsonSchema = {
  type: "object" as const,
  required: [
    "title",
    "summary",
    "requestType",
    "priority",
    "confidence",
    "needsHumanReview",
    "assignedTeam",
    "classificationReason",
    "extractedData",
    "riskFlags",
    "recommendedActions",
    "tasks",
    "draftResponse",
    "internalNotes",
  ],
  properties: {
    title: { type: "string", description: "Short, specific case title" },
    summary: { type: "string", description: "1-2 sentence summary of the case" },
    requestType: {
      type: "string",
      enum: ["SUPPORT", "SALES", "BILLING", "LEGAL", "OPERATIONS", "HR", "OTHER"],
    },
    priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "URGENT"] },
    confidence: {
      type: "number",
      description:
        "0..1 self-rated confidence in the classification. Use <0.75 if anything is ambiguous.",
    },
    needsHumanReview: {
      type: "boolean",
      description:
        "True if the case touches refunds, legal, compliance, financial risk, angry customers, or missing critical info.",
    },
    assignedTeam: {
      type: "string",
      description: "e.g. 'Billing', 'Legal & Compliance', 'Customer Success'",
    },
    classificationReason: {
      type: "string",
      description: "1-3 sentences explaining how you classified the case",
    },
    extractedData: {
      type: "object",
      required: [
        "customerIntent",
        "keyFacts",
        "entities",
        "deadlines",
        "moneyAmounts",
        "contactInfo",
        "missingInformation",
      ],
      properties: {
        customerIntent: { type: "string" },
        keyFacts: { type: "array", items: { type: "string" } },
        entities: {
          type: "object",
          additionalProperties: { type: "string" },
        },
        deadlines: { type: "array", items: { type: "string" } },
        moneyAmounts: { type: "array", items: { type: "string" } },
        contactInfo: {
          type: "object",
          additionalProperties: { type: "string" },
        },
        missingInformation: { type: "array", items: { type: "string" } },
      },
    },
    riskFlags: {
      type: "array",
      items: {
        type: "object",
        required: ["type", "severity", "reason"],
        properties: {
          type: { type: "string" },
          severity: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
          reason: { type: "string" },
        },
      },
    },
    recommendedActions: {
      type: "array",
      items: {
        type: "object",
        required: ["action", "tool", "reason", "requiresApproval"],
        properties: {
          action: { type: "string" },
          tool: {
            type: "string",
            enum: [
              "createInternalTask",
              "routeCase",
              "draftCustomerEmail",
              "createCalendarFollowUp",
              "sendToHumanReview",
            ],
          },
          reason: { type: "string" },
          requiresApproval: { type: "boolean" },
        },
      },
    },
    tasks: {
      type: "array",
      items: {
        type: "object",
        required: ["title", "description", "ownerTeam"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          ownerTeam: { type: "string" },
        },
      },
    },
    draftResponse: {
      type: "string",
      description:
        "Professional, calm, helpful reply to the customer. Do NOT promise refunds, legal outcomes, or compensation.",
    },
    internalNotes: {
      type: "string",
      description: "Notes for the human operator — context, risks, suggestions",
    },
  },
};
