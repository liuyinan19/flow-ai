import { NextResponse } from "next/server";
import { createAndAnalyzeCase } from "@/lib/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEMO_CASE = {
  customerName: "Mara Chen",
  customerEmail: "mara@acmeco.com",
  rawInput: `Hi support team — we onboarded last month on the Growth plan and it's been mostly great, but two things are killing us:

1) Our weekly export job has been failing for the last 3 days. We rely on it every Monday morning. Logs show a 504 from your /v1/exports endpoint around 8:05 UTC.
2) Our finance team is asking about an unexpected $1,840 line item on the November invoice (INV-2381) labeled "premium support". We never enabled premium support.

We have a board meeting Tuesday — if the export job isn't fixed by Monday EOD we'll need to consider rolling back. Please confirm by Friday 5pm PT.

Thanks,
Mara — Head of Ops, AcmeCo`,
  inputType: "TEXT" as const,
  businessCategory: "Customer Success",
};

export async function POST() {
  const result = await createAndAnalyzeCase(DEMO_CASE);
  return NextResponse.json({
    caseId: result.caseId,
    source: result.outcome.source,
  });
}
