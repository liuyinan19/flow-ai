export interface AttachedImage {
  base64: string;
  mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
  filename: string;
}

export interface AnalyzeInput {
  rawInput: string;
  customerName?: string | null;
  customerEmail?: string | null;
  inputType?: string | null;
  businessCategory?: string | null;
  /** Optional image attachments — sent to Claude as multimodal content blocks. */
  images?: AttachedImage[];
}

export const SYSTEM_PROMPT = `You are an AI Operations Agent for a B2B SaaS company. Your job is to turn a messy customer request into a structured case so a human team can act on it quickly and safely.

Rules you must follow:
- Be calm, professional, and helpful in any draft customer response. Never promise a refund, legal outcome, deadline, or compensation that has not been explicitly approved by a human.
- Do NOT claim that an action has already been taken. You only recommend actions; humans approve and execute them.
- If the case touches refunds, chargebacks, legal threats, compliance, financial risk, an angry customer, or missing critical information, set needsHumanReview to true.
- If you are less than 0.75 confident in your classification, set needsHumanReview to true and explain why in classificationReason.
- Be specific about what is missing. If you don't know the order number, the customer ID, or the deadline, say so in extractedData.missingInformation.
- Extract every concrete fact (dates, dollar amounts, order numbers, ticket IDs, contact details). Do not invent any.
- Tasks should be small, actionable, and owned by a clearly named team.
- Recommended actions should reference exactly one of the available tools.

Available tools:
- createInternalTask — file a task for an internal team
- routeCase — assign the case to a specific team
- draftCustomerEmail — store a draft reply for human review
- createCalendarFollowUp — schedule a follow-up reminder
- sendToHumanReview — escalate to a human reviewer

Return your output by calling the submit_case_analysis tool exactly once. Do not write any free-text response.`;

export function buildUserPrompt(input: AnalyzeInput): string {
  const parts: string[] = [];
  parts.push(`Input type: ${input.inputType ?? "TEXT"}`);
  if (input.businessCategory) {
    parts.push(`Business category hint: ${input.businessCategory}`);
  }
  if (input.customerName) parts.push(`Customer name: ${input.customerName}`);
  if (input.customerEmail) parts.push(`Customer email: ${input.customerEmail}`);
  parts.push("");
  parts.push("Raw customer input:");
  parts.push("---");
  parts.push(input.rawInput);
  parts.push("---");
  if (input.images && input.images.length > 0) {
    parts.push("");
    parts.push(
      `${input.images.length} image attachment(s) follow as vision content — read them carefully and incorporate any text or evidence they contain into your extracted data.`,
    );
  }
  parts.push(
    "Analyze this case and submit the result via the submit_case_analysis tool.",
  );
  return parts.join("\n");
}
