import type { CaseAnalysisResult } from "@/lib/types";

const REVIEW_KEYWORDS = [
  "refund",
  "chargeback",
  "lawsuit",
  "lawyer",
  "attorney",
  "sue",
  "legal action",
  "compliance",
  "gdpr",
  "hipaa",
  "ccpa",
  "data breach",
  "security incident",
  "escalate",
  "cancel my account",
  "unacceptable",
  "outraged",
  "demand",
];

export function applyGuardrails(
  analysis: CaseAnalysisResult,
  rawInput: string,
): { analysis: CaseAnalysisResult; reasons: string[] } {
  const reasons: string[] = [];
  let needsHumanReview = analysis.needsHumanReview;

  if (analysis.confidence < 0.75) {
    needsHumanReview = true;
    reasons.push(
      `Confidence ${analysis.confidence.toFixed(2)} is below the 0.75 floor.`,
    );
  }

  if (analysis.riskFlags.some((flag) => flag.severity === "HIGH")) {
    needsHumanReview = true;
    reasons.push("At least one HIGH-severity risk flag is present.");
  }

  if (analysis.requestType === "LEGAL") {
    needsHumanReview = true;
    reasons.push("Request type is LEGAL — always routed to human review.");
  }

  const lower = rawInput.toLowerCase();
  const triggered = REVIEW_KEYWORDS.filter((k) => lower.includes(k));
  if (triggered.length > 0) {
    needsHumanReview = true;
    reasons.push(
      `Trigger keywords detected in input: ${triggered.join(", ")}.`,
    );
  }

  // Missing-info trigger only fires on high-stakes request types. A vanilla
  // SALES / SUPPORT / HR inquiry naturally has many "missing info" items
  // (budget, timeline, decision maker, etc.) — that's normal qualification work
  // for the owning team, not a reason to escalate.
  const HIGH_STAKES_TYPES = ["BILLING", "LEGAL", "OPERATIONS"] as const;
  const isHighStakes = HIGH_STAKES_TYPES.includes(
    analysis.requestType as (typeof HIGH_STAKES_TYPES)[number],
  );
  if (isHighStakes && analysis.extractedData.missingInformation.length >= 3) {
    needsHumanReview = true;
    reasons.push(
      `3+ missing-information items on a ${analysis.requestType} case — too ambiguous to auto-process.`,
    );
  }

  return {
    analysis: { ...analysis, needsHumanReview },
    reasons,
  };
}
