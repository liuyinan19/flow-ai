import { createAndAnalyzeCase } from "@/lib/pipeline";
import {
  clientIp,
  DEFAULT_LIMITS,
  makeRateLimitResponse,
  rateLimit,
} from "@/lib/rate-limit";

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

const STEPS_BEFORE_WORK = ["reading"] as const;
const STEPS_DURING_WORK = [
  "classifying",
  "extracting",
  "choosing_actions",
  "drafting",
] as const;
const STEPS_AFTER_WORK = ["creating_tasks", "flagging"] as const;

export async function POST(req: Request) {
  const limit = rateLimit(`demo:${clientIp(req)}`, DEFAULT_LIMITS.demo);
  if (!limit.allowed) return makeRateLimitResponse(limit.retryAfterSec);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };
      const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

      try {
        for (const name of STEPS_BEFORE_WORK) {
          send("step", { name });
          await delay(350);
        }

        send("step", { name: STEPS_DURING_WORK[0] });
        // Kick off the real pipeline.
        const workPromise = createAndAnalyzeCase(DEMO_CASE);

        // Emit the remaining "during work" steps while the LLM (or mock) runs.
        for (const name of STEPS_DURING_WORK.slice(1)) {
          await delay(550);
          send("step", { name });
        }

        const result = await workPromise;

        for (const name of STEPS_AFTER_WORK) {
          send("step", { name });
          await delay(300);
        }

        send("complete", {
          caseId: result.caseId,
          source: result.outcome.source,
        });
        controller.close();
      } catch (err) {
        send("error", {
          message: err instanceof Error ? err.message : "Demo failed.",
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Tell Vercel/Cloudflare/Nginx not to buffer.
      "X-Accel-Buffering": "no",
    },
  });
}
