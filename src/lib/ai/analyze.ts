import Anthropic from "@anthropic-ai/sdk";
import { caseAnalysisJsonSchema, caseAnalysisSchema } from "./schema";
import { SYSTEM_PROMPT, buildUserPrompt, type AnalyzeInput } from "./prompt";
import { applyGuardrails } from "./guardrails";
import { runMockAnalysis } from "./mock-pipeline";
import type { CaseAnalysisResult } from "@/lib/types";

const MODEL = "claude-sonnet-4-5";
const TOOL_NAME = "submit_case_analysis";

export interface AnalyzeOutcome {
  analysis: CaseAnalysisResult;
  source: "anthropic" | "mock" | "fallback";
  guardrailReasons: string[];
}

export async function runAnalysis(input: AnalyzeInput): Promise<AnalyzeOutcome> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    const analysis = runMockAnalysis(input);
    const { analysis: gated, reasons } = applyGuardrails(analysis, input.rawInput);
    return { analysis: gated, source: "mock", guardrailReasons: reasons };
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: [
        {
          name: TOOL_NAME,
          description:
            "Submit the structured analysis of this case. You must call this tool exactly once.",
          input_schema: caseAnalysisJsonSchema,
        },
      ],
      tool_choice: { type: "tool", name: TOOL_NAME },
      messages: [{ role: "user", content: buildUserPrompt(input) }],
    });

    const toolUse = response.content.find(
      (block) => block.type === "tool_use" && block.name === TOOL_NAME,
    );

    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("Model did not call the submit_case_analysis tool.");
    }

    const parsed = caseAnalysisSchema.safeParse(toolUse.input);
    if (!parsed.success) {
      throw new Error(
        `Tool output failed schema validation: ${parsed.error.message}`,
      );
    }

    const { analysis, reasons } = applyGuardrails(parsed.data, input.rawInput);
    return { analysis, source: "anthropic", guardrailReasons: reasons };
  } catch (err) {
    console.error("[analyze] LLM call failed, falling back:", err);
    const analysis = runMockAnalysis(input);
    // Force review on fallback — we don't trust the heuristic enough to skip a human.
    analysis.needsHumanReview = true;
    analysis.confidence = Math.min(analysis.confidence, 0.6);
    analysis.internalNotes =
      `[Fallback pipeline] ${analysis.internalNotes ?? ""} The LLM call failed (${
        err instanceof Error ? err.message : "unknown error"
      }) — this output is from a deterministic heuristic and should be reviewed by a human.`.trim();
    const { analysis: gated, reasons } = applyGuardrails(analysis, input.rawInput);
    return { analysis: gated, source: "fallback", guardrailReasons: reasons };
  }
}
