import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { runMockAnalysis } from "./mock-pipeline";
import type { CaseAnalysisResult } from "@/lib/types";

const MODEL = "claude-sonnet-4-5";
const TOOL_NAME = "submit_draft";

const draftSchema = z.object({
  draftResponse: z.string().min(20),
  internalNotes: z.string(),
});

const draftJsonSchema = {
  type: "object" as const,
  required: ["draftResponse", "internalNotes"],
  properties: {
    draftResponse: {
      type: "string",
      description:
        "Professional, calm, helpful reply to the customer. Do NOT promise refunds, legal outcomes, deadlines, or compensation that have not been approved. Do NOT claim that any action has been taken.",
    },
    internalNotes: {
      type: "string",
      description: "Notes for the human reviewer about why this draft is safe.",
    },
  },
};

export interface DraftContext {
  rawInput: string;
  customerName: string | null;
  customerEmail: string | null;
  summary: string;
  requestType: string | null;
  assignedTeam: string | null;
  needsHumanReview: boolean;
  previousDraft: string | null;
}

export interface RegenerateDraftOutcome {
  draftResponse: string;
  internalNotes: string;
  source: "anthropic" | "mock" | "fallback";
}

const SYSTEM = `You are an AI Operations Agent rewriting only the customer-facing draft reply for an existing case. The rest of the case has already been classified.

Rules:
- Be calm, professional, and helpful. Never promise refunds, legal outcomes, deadlines, or compensation.
- Never claim an action has been taken. You are recommending one.
- Acknowledge receipt, set expectation, and ask for the smallest missing piece of information if helpful.
- Match the prior draft's voice but improve clarity and brevity. Do not invent facts.
- Return your output by calling the submit_draft tool exactly once.`;

function buildPrompt(ctx: DraftContext): string {
  const lines: string[] = [];
  lines.push(`Case summary: ${ctx.summary}`);
  if (ctx.requestType) lines.push(`Request type: ${ctx.requestType}`);
  if (ctx.assignedTeam) lines.push(`Assigned team: ${ctx.assignedTeam}`);
  if (ctx.needsHumanReview)
    lines.push("This case is flagged for human review — be extra cautious.");
  if (ctx.customerName) lines.push(`Customer name: ${ctx.customerName}`);
  if (ctx.customerEmail) lines.push(`Customer email: ${ctx.customerEmail}`);
  lines.push("");
  lines.push("Raw customer input:");
  lines.push("---");
  lines.push(ctx.rawInput);
  lines.push("---");
  if (ctx.previousDraft) {
    lines.push("");
    lines.push("Previous draft (to improve, not just paraphrase):");
    lines.push("---");
    lines.push(ctx.previousDraft);
    lines.push("---");
  }
  lines.push(
    "Write a better draft reply and submit it via the submit_draft tool.",
  );
  return lines.join("\n");
}

export async function regenerateDraft(
  ctx: DraftContext,
): Promise<RegenerateDraftOutcome> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    const mock = runMockAnalysis({
      rawInput: ctx.rawInput,
      customerName: ctx.customerName,
      customerEmail: ctx.customerEmail,
    });
    return {
      draftResponse: mock.draftResponse,
      internalNotes: mock.internalNotes,
      source: "mock",
    };
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM,
      tools: [
        {
          name: TOOL_NAME,
          description:
            "Submit the new draft customer reply. Call this exactly once.",
          input_schema: draftJsonSchema,
        },
      ],
      tool_choice: { type: "tool", name: TOOL_NAME },
      messages: [{ role: "user", content: buildPrompt(ctx) }],
    });

    const toolUse = response.content.find(
      (b) => b.type === "tool_use" && b.name === TOOL_NAME,
    );
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("Model did not call submit_draft tool.");
    }
    const parsed = draftSchema.safeParse(toolUse.input);
    if (!parsed.success) {
      throw new Error(`Draft tool output invalid: ${parsed.error.message}`);
    }
    return { ...parsed.data, source: "anthropic" };
  } catch (err) {
    console.error("[regenerate-draft] LLM failed, falling back:", err);
    const mock = runMockAnalysis({
      rawInput: ctx.rawInput,
      customerName: ctx.customerName,
      customerEmail: ctx.customerEmail,
    });
    return {
      draftResponse: mock.draftResponse,
      internalNotes: `[Fallback] ${mock.internalNotes}`,
      source: "fallback",
    };
  }
}

// Lets the route handler stash the regenerated draft on the existing analysis.
export function applyDraftToAnalysis<T extends Pick<CaseAnalysisResult, "draftResponse" | "internalNotes">>(
  analysis: T,
  outcome: RegenerateDraftOutcome,
): T {
  return {
    ...analysis,
    draftResponse: outcome.draftResponse,
    internalNotes: outcome.internalNotes,
  };
}
