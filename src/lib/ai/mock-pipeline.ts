import type {
  CaseAnalysisResult,
  Priority,
  RequestType,
} from "@/lib/types";
import type { AnalyzeInput } from "./prompt";

// Deterministic mock pipeline used when no LLM key is configured.
// Heuristic-based — enough for the demo to be meaningful, but obviously
// not as good as the real model. The UI surfaces a banner explaining this.

interface Heuristic {
  test: (input: string) => boolean;
  result: Omit<CaseAnalysisResult, "extractedData"> & {
    extractedDataPatch?: Partial<CaseAnalysisResult["extractedData"]>;
  };
}

const HEURISTICS: Heuristic[] = [
  {
    test: (i) =>
      /refund|chargeback|cancel.{0,15}(subscription|account)/i.test(i),
    result: {
      title: "Customer requests refund",
      summary:
        "Customer is asking for a refund. Needs billing investigation and human approval before any commitment.",
      requestType: "BILLING" as RequestType,
      priority: "HIGH" as Priority,
      confidence: 0.78,
      needsHumanReview: true,
      assignedTeam: "Billing",
      classificationReason:
        "Message contains refund-related language. Billing handles refunds, but legal/finance approval is required before any commitment.",
      riskFlags: [
        {
          type: "Financial",
          severity: "HIGH" as const,
          reason: "Refund requests can lead to chargebacks or churn.",
        },
        {
          type: "Sentiment",
          severity: "MEDIUM" as const,
          reason: "Customer tone appears frustrated.",
        },
      ],
      recommendedActions: [
        {
          action: "Route to Billing team",
          tool: "routeCase" as const,
          reason: "Billing owns refund decisions.",
          requiresApproval: false,
        },
        {
          action: "Draft acknowledgement (do not promise refund)",
          tool: "draftCustomerEmail" as const,
          reason: "Acknowledge receipt without committing to an outcome.",
          requiresApproval: true,
        },
        {
          action: "Escalate to human reviewer",
          tool: "sendToHumanReview" as const,
          reason: "Refund decisions require a human.",
          requiresApproval: false,
        },
      ],
      tasks: [
        {
          title: "Verify customer account & charge history",
          description:
            "Pull the customer's last 90 days of invoices and confirm the disputed charge.",
          ownerTeam: "Billing",
        },
        {
          title: "Reply within 1 business day",
          description:
            "Use the drafted acknowledgement after human review.",
          ownerTeam: "Customer Success",
        },
      ],
      draftResponse:
        "Hi there,\n\nThank you for reaching out, and I'm sorry for the frustration this has caused. I've logged your request and our billing team is reviewing your account history right now. We'll come back to you within one business day with a clear next step.\n\nIn the meantime, could you confirm the email associated with the account and the approximate date of the charge in question? That will help us move faster.\n\nBest,\nThe Operations Team",
      internalNotes:
        "Refund — do not commit to anything until Billing has reviewed charge history.",
      extractedDataPatch: {
        customerIntent: "Get a refund / cancel.",
        keyFacts: ["Refund explicitly requested in message."],
        missingInformation: [
          "Order or invoice ID",
          "Date of disputed charge",
          "Reason for refund (product, billing error, dissatisfaction)",
        ],
      },
    },
  },
  {
    test: (i) =>
      /pricing|quote|how much|enterprise plan|implementation|timeline/i.test(i),
    result: {
      title: "Inbound sales inquiry — pricing & implementation",
      summary:
        "Prospect is evaluating the product and asking about pricing and implementation timeline.",
      requestType: "SALES" as RequestType,
      priority: "MEDIUM" as Priority,
      confidence: 0.86,
      needsHumanReview: false,
      assignedTeam: "Sales",
      classificationReason:
        "Message asks about pricing, plans, or implementation — standard inbound sales lead.",
      riskFlags: [],
      recommendedActions: [
        {
          action: "Route to Sales team",
          tool: "routeCase" as const,
          reason: "Inbound lead — assign to a sales rep.",
          requiresApproval: false,
        },
        {
          action: "Draft introductory reply with pricing overview",
          tool: "draftCustomerEmail" as const,
          reason: "Standard inbound sales response.",
          requiresApproval: true,
        },
        {
          action: "Schedule discovery call follow-up",
          tool: "createCalendarFollowUp" as const,
          reason: "Sales process requires a discovery call.",
          requiresApproval: false,
        },
      ],
      tasks: [
        {
          title: "Assign to a rep within the sales region",
          description: "Use existing round-robin rules.",
          ownerTeam: "Sales",
        },
        {
          title: "Send pricing one-pager + discovery call link",
          description: "Use the standard inbound nurture template.",
          ownerTeam: "Sales",
        },
      ],
      draftResponse:
        "Hi there,\n\nThanks for reaching out — happy to help you evaluate. Pricing for our enterprise plan depends on team size and integration scope, and I'd love to share specifics on a quick 20-minute call. We typically see new customers fully onboarded in 2–4 weeks.\n\nHere's a link to grab time on my calendar: [calendar link]. In the meantime, mind sharing your team size and the main workflow you're hoping to automate?\n\nBest,\nThe Sales Team",
      internalNotes: "Inbound lead — standard nurture.",
      extractedDataPatch: {
        customerIntent: "Learn about pricing and implementation timeline.",
        keyFacts: ["Asked about enterprise pricing", "Asked about timeline"],
      },
    },
  },
  {
    test: (i) =>
      /lawsuit|lawyer|attorney|gdpr|hipaa|compliance|data breach|legal/i.test(
        i,
      ),
    result: {
      title: "Potential legal/compliance complaint",
      summary:
        "Customer raised concerns that touch legal or compliance — must be escalated to Legal before any reply.",
      requestType: "LEGAL" as RequestType,
      priority: "URGENT" as Priority,
      confidence: 0.82,
      needsHumanReview: true,
      assignedTeam: "Legal & Compliance",
      classificationReason:
        "Message contains legal/compliance terminology. Always escalated to a human reviewer.",
      riskFlags: [
        {
          type: "Legal",
          severity: "HIGH" as const,
          reason: "Customer referenced legal action or compliance regulations.",
        },
      ],
      recommendedActions: [
        {
          action: "Send to human review",
          tool: "sendToHumanReview" as const,
          reason: "Legal cases must be reviewed by Legal before any reply.",
          requiresApproval: false,
        },
        {
          action: "Route to Legal & Compliance",
          tool: "routeCase" as const,
          reason: "Owning team for this case.",
          requiresApproval: false,
        },
      ],
      tasks: [
        {
          title: "Legal reviews case within 4 business hours",
          description:
            "Acknowledge nothing in writing until Legal has reviewed the message.",
          ownerTeam: "Legal & Compliance",
        },
      ],
      draftResponse:
        "Hi there,\n\nThank you for reaching out. I'm forwarding your message to our compliance team, who will follow up directly with next steps. We take this seriously and appreciate your patience while we review.\n\nBest,\nThe Operations Team",
      internalNotes:
        "Do NOT engage on the substance. Legal will own the response.",
      extractedDataPatch: {
        customerIntent: "Raise a legal or compliance concern.",
        missingInformation: [
          "Specific regulation referenced",
          "Whether this is a formal complaint or an inquiry",
        ],
      },
    },
  },
  {
    test: (i) => /invoice|payment failed|past due|vendor/i.test(i),
    result: {
      title: "Vendor / invoicing issue",
      summary:
        "Vendor or finance-related issue around an invoice or payment that needs operations attention.",
      requestType: "OPERATIONS" as RequestType,
      priority: "MEDIUM" as Priority,
      confidence: 0.8,
      needsHumanReview: false,
      assignedTeam: "Finance Operations",
      classificationReason: "Invoice/vendor language — standard ops workflow.",
      riskFlags: [
        {
          type: "Financial",
          severity: "MEDIUM" as const,
          reason: "Touches money flows — handle carefully.",
        },
      ],
      recommendedActions: [
        {
          action: "Route to Finance Operations",
          tool: "routeCase" as const,
          reason: "Owning team for invoice issues.",
          requiresApproval: false,
        },
        {
          action: "Create reconciliation task",
          tool: "createInternalTask" as const,
          reason: "Need to reconcile the invoice in AP system.",
          requiresApproval: false,
        },
      ],
      tasks: [
        {
          title: "Reconcile invoice in AP system",
          description: "Match invoice to PO and confirm payment status.",
          ownerTeam: "Finance Operations",
        },
        {
          title: "Reply with confirmed payment timeline",
          description: "Use a polite, factual tone.",
          ownerTeam: "Finance Operations",
        },
      ],
      draftResponse:
        "Hi there,\n\nThanks for the note. We've logged this and our finance ops team is reconciling the invoice today. We'll come back to you with a confirmed payment timeline within one business day.\n\nBest,\nThe Operations Team",
      internalNotes: "Standard AP reconciliation flow.",
      extractedDataPatch: {
        customerIntent: "Resolve an invoice or vendor payment issue.",
      },
    },
  },
];

const DEFAULT_RESULT: CaseAnalysisResult = {
  title: "General customer inquiry",
  summary:
    "A general inbound inquiry that doesn't fall into a clear category. Routed to support for triage.",
  requestType: "SUPPORT",
  priority: "MEDIUM",
  confidence: 0.7,
  needsHumanReview: true,
  assignedTeam: "Customer Success",
  classificationReason:
    "No strong category signal detected — routing to support for human triage.",
  extractedData: {
    customerIntent: "General inquiry — needs human triage.",
    keyFacts: [],
    entities: {},
    deadlines: [],
    moneyAmounts: [],
    contactInfo: {},
    missingInformation: ["Specific intent unclear from the message."],
  },
  riskFlags: [],
  recommendedActions: [
    {
      action: "Route to Customer Success",
      tool: "routeCase",
      reason: "Default routing while a human classifies the request.",
      requiresApproval: false,
    },
    {
      action: "Send to human review",
      tool: "sendToHumanReview",
      reason: "Confidence is below the safe threshold.",
      requiresApproval: false,
    },
  ],
  tasks: [
    {
      title: "Triage and reclassify",
      description: "A human should determine the correct request type.",
      ownerTeam: "Customer Success",
    },
  ],
  draftResponse:
    "Hi there,\n\nThanks for reaching out — we've received your message and a team member will follow up shortly.\n\nBest,\nThe Operations Team",
  internalNotes: "Mock pipeline — no LLM key configured.",
};

export function runMockAnalysis(input: AnalyzeInput): CaseAnalysisResult {
  const hit = HEURISTICS.find((h) => h.test(input.rawInput));
  if (!hit) return cloneAndApplyContact(DEFAULT_RESULT, input);

  const base: CaseAnalysisResult = {
    ...DEFAULT_RESULT,
    ...hit.result,
    extractedData: {
      ...DEFAULT_RESULT.extractedData,
      ...(hit.result.extractedDataPatch ?? {}),
    },
  };

  return cloneAndApplyContact(base, input);
}

function cloneAndApplyContact(
  analysis: CaseAnalysisResult,
  input: AnalyzeInput,
): CaseAnalysisResult {
  const contactInfo: Record<string, string> = { ...analysis.extractedData.contactInfo };
  if (input.customerName) contactInfo.name = input.customerName;
  if (input.customerEmail) contactInfo.email = input.customerEmail;

  return {
    ...analysis,
    extractedData: {
      ...analysis.extractedData,
      contactInfo,
    },
  };
}
