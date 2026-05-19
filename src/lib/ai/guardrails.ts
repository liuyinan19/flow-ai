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

  if (analysis.extractedData.missingInformation.length >= 3) {
    needsHumanReview = true;
    reasons.push("3+ missing-information items — case is too ambiguous.");
  }

  return {
    analysis: { ...analysis, needsHumanReview },
    reasons,
  };
}
