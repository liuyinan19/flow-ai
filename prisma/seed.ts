import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

interface SeedCase {
  title: string;
  customerName: string;
  customerEmail: string;
  rawInput: string;
  inputType: string;
  status: string;
  requestType: string;
  priority: string;
  confidence: number;
  needsHumanReview: boolean;
  assignedTeam: string;
  analysis: {
    summary: string;
    classificationReason: string;
    extractedData: object;
    riskFlags: object[];
    recommendedActions: object[];
    draftResponse: string;
    internalNotes: string;
  };
  tasks: { title: string; description: string; status: string; ownerTeam: string }[];
  actions: {
    actionType: string;
    toolName: string;
    status: string;
    reason: string;
    payload: object;
  }[];
  activity: { eventType: string; message: string; metadata?: object }[];
}

const SEED_CASES: SeedCase[] = [
  {
    title: "Refund demand — annual plan, unhappy customer",
    customerName: "Devon Park",
    customerEmail: "devon@northwindlabs.com",
    rawInput:
      "I've been a customer for 14 months and your latest update broke our entire integration. We pay $12,000/year and got zero notice. We've already lost two days of revenue. Refund our annual fee or we're switching to your competitor on Monday. -Devon, CTO @ Northwind",
    inputType: "TEXT",
    status: "NEEDS_REVIEW",
    requestType: "BILLING",
    priority: "URGENT",
    confidence: 0.82,
    needsHumanReview: true,
    assignedTeam: "Billing",
    analysis: {
      summary:
        "Long-time customer reports a regression caused by a recent release, demands a full annual refund, and threatens churn.",
      classificationReason:
        "The message explicitly demands a refund of an annual fee and threatens to leave. Refunds are a Billing concern but must be reviewed by a human before any commitment.",
      extractedData: {
        customerIntent:
          "Get a refund of the annual subscription due to a breaking change.",
        keyFacts: [
          "Customer for 14 months",
          "Annual fee: $12,000",
          "Two days of revenue lost",
          "Update broke their integration with no advance notice",
        ],
        entities: {
          customer: "Northwind",
          contact: "Devon Park",
          role: "CTO",
        },
        deadlines: ["Switching by Monday"],
        moneyAmounts: ["$12,000/year"],
        contactInfo: { name: "Devon Park", email: "devon@northwindlabs.com" },
        missingInformation: [
          "Affected API endpoint or feature",
          "Release version that caused the regression",
        ],
      },
      riskFlags: [
        {
          type: "Financial",
          severity: "HIGH",
          reason: "Refund request for a $12,000 annual contract.",
        },
        {
          type: "Churn",
          severity: "HIGH",
          reason: "Customer explicitly threatened to leave on Monday.",
        },
        {
          type: "Sentiment",
          severity: "MEDIUM",
          reason: "Tone is frustrated and emphatic.",
        },
      ],
      recommendedActions: [
        {
          action: "Route to Billing team",
          tool: "routeCase",
          reason: "Refund decisions live in Billing.",
          requiresApproval: false,
        },
        {
          action: "Escalate to human reviewer",
          tool: "sendToHumanReview",
          reason: "Material financial decision + churn risk.",
          requiresApproval: false,
        },
        {
          action: "Draft empathetic acknowledgement (do NOT promise refund)",
          tool: "draftCustomerEmail",
          reason: "Acknowledge fast without committing to compensation.",
          requiresApproval: true,
        },
        {
          action: "Create incident task for engineering",
          tool: "createInternalTask",
          reason: "Engineering needs to investigate the regression.",
          requiresApproval: false,
        },
      ],
      draftResponse:
        "Hi Devon,\n\nThank you for flagging this, and I'm sorry for the disruption — losing two days of revenue is exactly the kind of impact we work hard to avoid. I've escalated your case to our billing team and to engineering, who are looking at what changed in our recent release.\n\nWe'll come back to you with a clear next step before end of day Friday. If it helps in the meantime, could you share the affected endpoint or a recent failed request ID? That will let our engineers move faster.\n\nWe appreciate your patience.\n\nBest,\nThe Operations Team",
      internalNotes:
        "Sensitive case. Confirm regression with engineering before any reply. Do not commit to refund language in the first response.",
    },
    tasks: [
      {
        title: "Engineering investigates regression in latest release",
        description:
          "Identify the breaking change Devon describes and confirm scope. Loop in the release captain.",
        status: "IN_PROGRESS",
        ownerTeam: "Engineering",
      },
      {
        title: "Billing reviews refund eligibility & churn risk",
        description:
          "Pull the full account history, contract terms, and any prior credits.",
        status: "TODO",
        ownerTeam: "Billing",
      },
      {
        title: "Customer Success sends acknowledgement",
        description:
          "Use the drafted reply only after Billing & Engineering have reviewed.",
        status: "TODO",
        ownerTeam: "Customer Success",
      },
    ],
    actions: [
      {
        actionType: "ROUTE_CASE",
        toolName: "routeCase",
        status: "COMPLETED",
        reason: "Refund decisions live in Billing.",
        payload: { team: "Billing" },
      },
      {
        actionType: "ROUTE_CASE",
        toolName: "sendToHumanReview",
        status: "COMPLETED",
        reason: "Material financial decision + churn risk.",
        payload: { escalated: true },
      },
      {
        actionType: "SEND_EMAIL",
        toolName: "draftCustomerEmail",
        status: "PENDING",
        reason: "Awaiting human approval before sending.",
        payload: { note: "Draft stored — awaiting human approval." },
      },
      {
        actionType: "CREATE_TASK",
        toolName: "createInternalTask",
        status: "COMPLETED",
        reason: "Engineering needs to investigate the regression.",
        payload: { taskCount: 3 },
      },
    ],
    activity: [
      {
        eventType: "case_created",
        message: "Case received from intake email.",
      },
      {
        eventType: "analysis_completed",
        message:
          "AI analysis completed (source: seed, confidence 0.82). HIGH financial + churn risk detected.",
      },
      {
        eventType: "status_change",
        message: "Status set to NEEDS_REVIEW after analysis.",
        metadata: { to: "NEEDS_REVIEW" },
      },
    ],
  },
  {
    title: "Enterprise pricing & implementation inquiry",
    customerName: "Priya Singh",
    customerEmail: "priya.singh@globex.io",
    rawInput:
      "Hello! I run platform engineering at Globex (around 800 engineers). We're evaluating tools in your space. Could you share enterprise pricing, SSO/SAML availability, SOC2 status, and a realistic implementation timeline? Ideally we'd be live by end of Q1. Happy to take a call next week.",
    inputType: "TEXT",
    status: "ANALYZED",
    requestType: "SALES",
    priority: "HIGH",
    confidence: 0.92,
    needsHumanReview: false,
    assignedTeam: "Sales",
    analysis: {
      summary:
        "Qualified enterprise lead asking about pricing, SSO/SAML, SOC2, and an end-of-Q1 implementation timeline.",
      classificationReason:
        "Message asks for pricing, security posture, and implementation timeline from a senior buyer at an 800-engineer company. Classic inbound enterprise lead.",
      extractedData: {
        customerIntent:
          "Evaluate the product for an enterprise rollout, get to a discovery call.",
        keyFacts: [
          "Globex platform engineering org, ~800 engineers",
          "Wants SSO/SAML",
          "Wants SOC2 status",
          "Target go-live: end of Q1",
        ],
        entities: {
          customer: "Globex",
          contact: "Priya Singh",
          role: "Platform engineering lead",
        },
        deadlines: ["End of Q1 go-live"],
        moneyAmounts: [],
        contactInfo: { name: "Priya Singh", email: "priya.singh@globex.io" },
        missingInformation: ["Budget range", "Procurement timeline"],
      },
      riskFlags: [],
      recommendedActions: [
        {
          action: "Route to Sales team",
          tool: "routeCase",
          reason: "Inbound enterprise lead — assign to the Sales rep covering accounts of this size.",
          requiresApproval: false,
        },
        {
          action: "Draft enterprise discovery email",
          tool: "draftCustomerEmail",
          reason: "Send security one-pager + calendar link.",
          requiresApproval: true,
        },
        {
          action: "Schedule discovery call",
          tool: "createCalendarFollowUp",
          reason: "Standard enterprise sales motion.",
          requiresApproval: false,
        },
      ],
      draftResponse:
        "Hi Priya,\n\nThanks for reaching out — happy to help with your evaluation. To answer your questions at a high level:\n\n• Pricing: enterprise plans are tailored to seat count and integration scope; happy to share specifics on a call.\n• SSO/SAML: fully supported on enterprise.\n• SOC2: we're SOC 2 Type II audited; I can share our latest report under NDA.\n• Timeline: an end-of-Q1 go-live is realistic for an org your size with a typical 2–4 week onboarding.\n\nHere's a calendar link for a 30-minute discovery call next week: [link]. In the meantime, mind sharing the main workflows you're hoping to automate?\n\nBest,\nThe Sales Team",
      internalNotes: "High-fit lead. Route to AE for enterprise.",
    },
    tasks: [
      {
        title: "Assign to enterprise AE",
        description: "Use existing round-robin for accounts >500 employees.",
        status: "DONE",
        ownerTeam: "Sales",
      },
      {
        title: "Send pricing + security packet",
        description: "Use the standard enterprise nurture sequence.",
        status: "IN_PROGRESS",
        ownerTeam: "Sales",
      },
    ],
    actions: [
      {
        actionType: "ROUTE_CASE",
        toolName: "routeCase",
        status: "COMPLETED",
        reason: "Inbound enterprise lead.",
        payload: { team: "Sales" },
      },
      {
        actionType: "SEND_EMAIL",
        toolName: "draftCustomerEmail",
        status: "PENDING",
        reason: "Awaiting AE approval.",
        payload: { note: "Discovery email drafted." },
      },
      {
        actionType: "CREATE_CALENDAR_EVENT",
        toolName: "createCalendarFollowUp",
        status: "COMPLETED",
        reason: "Standard enterprise sales motion.",
        payload: { suggestedDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString() },
      },
    ],
    activity: [
      { eventType: "case_created", message: "Case received from /cases/new." },
      {
        eventType: "analysis_completed",
        message: "AI analysis completed (source: seed, confidence 0.92).",
      },
      {
        eventType: "status_change",
        message: "Status set to ANALYZED after analysis.",
        metadata: { to: "ANALYZED" },
      },
    ],
  },
  {
    title: "Weekly export job failing — 504 on /v1/exports",
    customerName: "Sam Boyd",
    customerEmail: "sam@brightleaf.co",
    rawInput:
      "Hey — attaching screenshots from our admin panel showing 504 errors on the /v1/exports endpoint every Monday at 08:05 UTC for the last 3 weeks. Other endpoints are fine. Account: brightleaf-prod. Our finance team relies on these exports — can you take a look?",
    inputType: "SCREENSHOT",
    status: "IN_PROGRESS",
    requestType: "SUPPORT",
    priority: "HIGH",
    confidence: 0.88,
    needsHumanReview: false,
    assignedTeam: "Engineering",
    analysis: {
      summary:
        "Customer reports recurring 504 timeouts on the weekly export job. Reproducible, scoped to one endpoint, with consistent timing.",
      classificationReason:
        "Reproducible production bug report with concrete endpoint, timestamp pattern, and account identifier. Goes to engineering.",
      extractedData: {
        customerIntent: "Get the failing export job fixed.",
        keyFacts: [
          "Endpoint: /v1/exports",
          "Failing for 3 consecutive Mondays at 08:05 UTC",
          "Account: brightleaf-prod",
        ],
        entities: {
          customer: "Brightleaf",
          contact: "Sam Boyd",
          account: "brightleaf-prod",
        },
        deadlines: [],
        moneyAmounts: [],
        contactInfo: { name: "Sam Boyd", email: "sam@brightleaf.co" },
        missingInformation: ["Request ID for a failed call", "Approximate payload size"],
      },
      riskFlags: [
        {
          type: "Customer impact",
          severity: "MEDIUM",
          reason: "Finance workflow blocked weekly.",
        },
      ],
      recommendedActions: [
        {
          action: "Route to Engineering",
          tool: "routeCase",
          reason: "Backend issue.",
          requiresApproval: false,
        },
        {
          action: "Create engineering ticket",
          tool: "createInternalTask",
          reason: "Reproducible incident worth tracking.",
          requiresApproval: false,
        },
        {
          action: "Draft acknowledgement asking for a request ID",
          tool: "draftCustomerEmail",
          reason: "We need a request ID to investigate.",
          requiresApproval: true,
        },
      ],
      draftResponse:
        "Hi Sam,\n\nThanks for the detailed report — the Monday 08:05 UTC pattern is helpful. I've routed this to our engineering team and we're looking at the export job specifically.\n\nCould you share a request ID from one of the failed calls and a rough sense of the export payload size? That will let us narrow this down faster.\n\nWe'll send a substantive update by end of day tomorrow.\n\nBest,\nThe Operations Team",
      internalNotes:
        "Pattern looks like a job timeout. Engineering should check the worker pool sizing on the export queue.",
    },
    tasks: [
      {
        title: "Investigate 504s on /v1/exports for brightleaf-prod",
        description:
          "Pull logs from the last 3 Mondays around 08:05 UTC. Check worker pool saturation.",
        status: "IN_PROGRESS",
        ownerTeam: "Engineering",
      },
      {
        title: "Reply to Sam with a request-ID ask",
        description: "Use the drafted acknowledgement.",
        status: "DONE",
        ownerTeam: "Customer Success",
      },
    ],
    actions: [
      {
        actionType: "ROUTE_CASE",
        toolName: "routeCase",
        status: "COMPLETED",
        reason: "Backend issue.",
        payload: { team: "Engineering" },
      },
      {
        actionType: "CREATE_TASK",
        toolName: "createInternalTask",
        status: "COMPLETED",
        reason: "Reproducible incident worth tracking.",
        payload: { taskCount: 2 },
      },
      {
        actionType: "SEND_EMAIL",
        toolName: "draftCustomerEmail",
        status: "COMPLETED",
        reason: "Reply sent after human approval.",
        payload: { sent: true, sentAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
      },
    ],
    activity: [
      { eventType: "case_created", message: "Case received from intake." },
      {
        eventType: "analysis_completed",
        message: "AI analysis completed (source: seed, confidence 0.88).",
      },
      {
        eventType: "status_change",
        message: "Status set to ANALYZED.",
        metadata: { to: "ANALYZED" },
      },
      {
        eventType: "tool_decision",
        message: "Draft reply approved by human.",
      },
      {
        eventType: "status_change",
        message: "Status moved to IN_PROGRESS.",
        metadata: { to: "IN_PROGRESS" },
      },
    ],
  },
  {
    title: "Vendor invoice discrepancy — unexpected $1,840 line item",
    customerName: "Jordan Reyes",
    customerEmail: "ap@bayhorseco.com",
    rawInput:
      "Hi — invoice INV-2381 dated 11/02 has a $1,840 line item labeled 'premium support add-on'. We never agreed to this. Please credit and reissue. Also need a W-9 on file. Thanks.",
    inputType: "TEXT",
    status: "ANALYZED",
    requestType: "OPERATIONS",
    priority: "MEDIUM",
    confidence: 0.84,
    needsHumanReview: false,
    assignedTeam: "Finance Operations",
    analysis: {
      summary:
        "Vendor disputes an unexpected $1,840 line item on invoice INV-2381 and requests a credit + reissue. Also requests a W-9.",
      classificationReason:
        "Two distinct AP requests: invoice correction and W-9. Finance ops owns both.",
      extractedData: {
        customerIntent: "Get an incorrect invoice corrected and obtain a W-9.",
        keyFacts: [
          "Invoice ID: INV-2381",
          "Invoice date: 11/02",
          "Disputed amount: $1,840",
          "Disputed line: 'premium support add-on'",
          "Customer denies enabling premium support",
        ],
        entities: { customer: "Bay Horse Co.", contact: "Jordan Reyes" },
        deadlines: [],
        moneyAmounts: ["$1,840"],
        contactInfo: { name: "Jordan Reyes", email: "ap@bayhorseco.com" },
        missingInformation: ["Account ID at our end"],
      },
      riskFlags: [
        {
          type: "Financial",
          severity: "MEDIUM",
          reason: "Touches an invoice — verify before issuing a credit.",
        },
      ],
      recommendedActions: [
        {
          action: "Route to Finance Operations",
          tool: "routeCase",
          reason: "Owning team.",
          requiresApproval: false,
        },
        {
          action: "Create reconciliation task",
          tool: "createInternalTask",
          reason: "Need to reconcile INV-2381 and check if premium support was enabled.",
          requiresApproval: false,
        },
        {
          action: "Draft reply with W-9 + timeline for credit",
          tool: "draftCustomerEmail",
          reason: "Standard AP response.",
          requiresApproval: true,
        },
      ],
      draftResponse:
        "Hi Jordan,\n\nThanks for flagging this. I've routed INV-2381 to our finance ops team to reconcile the $1,840 line item; if it was added in error we'll issue a credit and reissue the invoice within 3 business days. Attaching our current W-9.\n\nBest,\nThe Operations Team",
      internalNotes: "Standard reconciliation. Confirm with billing whether premium support was ever enabled.",
    },
    tasks: [
      {
        title: "Reconcile INV-2381 against contract & feature flags",
        description: "Verify whether premium support was enabled and on what date.",
        status: "TODO",
        ownerTeam: "Finance Operations",
      },
      {
        title: "Send W-9 + credit timeline reply",
        description: "Use the drafted reply.",
        status: "TODO",
        ownerTeam: "Finance Operations",
      },
    ],
    actions: [
      {
        actionType: "ROUTE_CASE",
        toolName: "routeCase",
        status: "COMPLETED",
        reason: "Owning team.",
        payload: { team: "Finance Operations" },
      },
      {
        actionType: "CREATE_TASK",
        toolName: "createInternalTask",
        status: "COMPLETED",
        reason: "Reconciliation needed.",
        payload: { taskCount: 2 },
      },
      {
        actionType: "SEND_EMAIL",
        toolName: "draftCustomerEmail",
        status: "PENDING",
        reason: "Awaiting human approval.",
        payload: { note: "Reply drafted." },
      },
    ],
    activity: [
      { eventType: "case_created", message: "Case received from intake." },
      {
        eventType: "analysis_completed",
        message: "AI analysis completed (source: seed, confidence 0.84).",
      },
      {
        eventType: "status_change",
        message: "Status set to ANALYZED.",
        metadata: { to: "ANALYZED" },
      },
    ],
  },
  {
    title: "GDPR data deletion request — sensitive",
    customerName: "Ana Ribeiro",
    customerEmail: "ana.ribeiro@meadowlark.eu",
    rawInput:
      "I am exercising my right to erasure under GDPR Article 17. Please delete all personal data my company has stored in your platform, including backups, within 30 days. If this is not done I will escalate to our DPO and the regulator. -Ana Ribeiro, Privacy Lead, Meadowlark GmbH",
    inputType: "TEXT",
    status: "NEEDS_REVIEW",
    requestType: "LEGAL",
    priority: "URGENT",
    confidence: 0.94,
    needsHumanReview: true,
    assignedTeam: "Legal & Compliance",
    analysis: {
      summary:
        "Formal GDPR Article 17 erasure request from a privacy lead, with a 30-day deadline and an escalation threat. Must go to Legal & Compliance immediately.",
      classificationReason:
        "Explicit invocation of GDPR Article 17 with a regulatory threat. Always routed to Legal regardless of other signals.",
      extractedData: {
        customerIntent: "Exercise GDPR right to erasure.",
        keyFacts: [
          "GDPR Article 17 invoked",
          "30-day deadline",
          "Escalation threat to DPO and regulator",
          "Company: Meadowlark GmbH (EU)",
        ],
        entities: {
          customer: "Meadowlark GmbH",
          contact: "Ana Ribeiro",
          role: "Privacy Lead",
        },
        deadlines: ["30 days from request"],
        moneyAmounts: [],
        contactInfo: { name: "Ana Ribeiro", email: "ana.ribeiro@meadowlark.eu" },
        missingInformation: ["Workspace/account IDs to scope the deletion"],
      },
      riskFlags: [
        {
          type: "Legal",
          severity: "HIGH",
          reason: "Formal GDPR Article 17 request with regulatory escalation threat.",
        },
        {
          type: "Compliance",
          severity: "HIGH",
          reason: "Hard 30-day window under GDPR.",
        },
      ],
      recommendedActions: [
        {
          action: "Escalate to Legal & Compliance immediately",
          tool: "sendToHumanReview",
          reason: "Regulatory matter — must be handled by Legal.",
          requiresApproval: false,
        },
        {
          action: "Route to Legal & Compliance",
          tool: "routeCase",
          reason: "Owning team.",
          requiresApproval: false,
        },
        {
          action: "Schedule 30-day deadline follow-up",
          tool: "createCalendarFollowUp",
          reason: "GDPR window is strict.",
          requiresApproval: false,
        },
      ],
      draftResponse:
        "Hi Ana,\n\nThank you for your message. I'm forwarding your request to our privacy & compliance team, who will follow up directly with the next steps and timeline. We take this seriously and appreciate your patience while we review.\n\nBest,\nThe Operations Team",
      internalNotes:
        "Do NOT engage on the substance. Legal owns the response. Confirm workspace scope before any deletion runs.",
    },
    tasks: [
      {
        title: "Legal acknowledges within 72 hours",
        description: "GDPR requires a timely response.",
        status: "TODO",
        ownerTeam: "Legal & Compliance",
      },
      {
        title: "Scope the data to be deleted",
        description: "Identify the workspace(s) and all PII storage.",
        status: "TODO",
        ownerTeam: "Engineering",
      },
      {
        title: "Schedule 30-day deadline reminder",
        description: "Calendar event was created automatically.",
        status: "DONE",
        ownerTeam: "Legal & Compliance",
      },
    ],
    actions: [
      {
        actionType: "ROUTE_CASE",
        toolName: "sendToHumanReview",
        status: "COMPLETED",
        reason: "Regulatory matter.",
        payload: { escalated: true },
      },
      {
        actionType: "ROUTE_CASE",
        toolName: "routeCase",
        status: "COMPLETED",
        reason: "Owning team.",
        payload: { team: "Legal & Compliance" },
      },
      {
        actionType: "CREATE_CALENDAR_EVENT",
        toolName: "createCalendarFollowUp",
        status: "COMPLETED",
        reason: "30-day GDPR deadline.",
        payload: {
          suggestedDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        },
      },
    ],
    activity: [
      { eventType: "case_created", message: "Case received from intake form." },
      {
        eventType: "analysis_completed",
        message: "AI analysis completed (source: seed, confidence 0.94). HIGH legal + compliance risk.",
      },
      {
        eventType: "status_change",
        message: "Status set to NEEDS_REVIEW after analysis.",
        metadata: { to: "NEEDS_REVIEW" },
      },
    ],
  },
];

async function main() {
  console.log("Clearing existing data…");
  await db.activityLog.deleteMany();
  await db.mockIntegrationAction.deleteMany();
  await db.task.deleteMany();
  await db.caseAnalysis.deleteMany();
  await db.case.deleteMany();

  console.log(`Seeding ${SEED_CASES.length} cases…`);
  const baseTime = Date.now();

  for (let i = 0; i < SEED_CASES.length; i++) {
    const seed = SEED_CASES[i];
    // Stagger creation times so the dashboard shows a realistic spread.
    const createdAt = new Date(baseTime - (SEED_CASES.length - i) * 1000 * 60 * 60 * 6);

    const created = await db.case.create({
      data: {
        title: seed.title,
        customerName: seed.customerName,
        customerEmail: seed.customerEmail,
        rawInput: seed.rawInput,
        inputType: seed.inputType,
        status: seed.status,
        requestType: seed.requestType,
        priority: seed.priority,
        confidence: seed.confidence,
        needsHumanReview: seed.needsHumanReview,
        assignedTeam: seed.assignedTeam,
        createdAt,
        updatedAt: createdAt,
        analysis: {
          create: {
            summary: seed.analysis.summary,
            classificationReason: seed.analysis.classificationReason,
            extractedData: JSON.stringify(seed.analysis.extractedData),
            riskFlags: JSON.stringify(seed.analysis.riskFlags),
            recommendedActions: JSON.stringify(seed.analysis.recommendedActions),
            draftResponse: seed.analysis.draftResponse,
            internalNotes: seed.analysis.internalNotes,
            createdAt,
          },
        },
      },
    });

    for (const t of seed.tasks) {
      await db.task.create({
        data: {
          caseId: created.id,
          title: t.title,
          description: t.description,
          status: t.status,
          ownerTeam: t.ownerTeam,
          createdAt,
          updatedAt: createdAt,
        },
      });
    }

    for (const a of seed.actions) {
      await db.mockIntegrationAction.create({
        data: {
          caseId: created.id,
          actionType: a.actionType,
          toolName: a.toolName,
          status: a.status,
          reason: a.reason,
          payload: JSON.stringify(a.payload),
          createdAt,
        },
      });
    }

    for (let j = 0; j < seed.activity.length; j++) {
      const evt = seed.activity[j];
      await db.activityLog.create({
        data: {
          caseId: created.id,
          eventType: evt.eventType,
          message: evt.message,
          metadata: evt.metadata ? JSON.stringify(evt.metadata) : null,
          createdAt: new Date(createdAt.getTime() + j * 1000 * 60 * 5),
        },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
