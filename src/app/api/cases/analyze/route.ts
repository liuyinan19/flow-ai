import { NextResponse } from "next/server";
import { z } from "zod";
import { createAndAnalyzeCase } from "@/lib/pipeline";
import {
  ingestFile,
  composeRawInput,
  FileIngestError,
  type FileIngestResult,
} from "@/lib/file-ingest";
import type { AttachedImage } from "@/lib/ai/prompt";
import {
  clientIp,
  DEFAULT_LIMITS,
  makeRateLimitResponse,
  rateLimit,
} from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const baseSchema = z.object({
  rawInput: z.string().default(""),
  customerName: z.string().optional().nullable(),
  customerEmail: z.string().email().optional().nullable().or(z.literal("")),
  inputType: z
    .enum(["TEXT", "FORM", "FILE", "SCREENSHOT", "VOICE"])
    .optional(),
  businessCategory: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  const limit = rateLimit(`analyze:${clientIp(req)}`, DEFAULT_LIMITS.analyze);
  if (!limit.allowed) return makeRateLimitResponse(limit.retryAfterSec);

  const contentType = req.headers.get("content-type") ?? "";

  let body: z.infer<typeof baseSchema>;
  let ingested: FileIngestResult | null = null;
  const images: AttachedImage[] = [];

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const fields = {
        rawInput: (form.get("rawInput") as string | null) ?? "",
        customerName: (form.get("customerName") as string | null) ?? undefined,
        customerEmail: (form.get("customerEmail") as string | null) ?? undefined,
        inputType:
          (form.get("inputType") as
            | "TEXT"
            | "FORM"
            | "FILE"
            | "SCREENSHOT"
            | "VOICE"
            | null) ?? undefined,
        businessCategory:
          (form.get("businessCategory") as string | null) ?? undefined,
      };
      const parsed = baseSchema.safeParse(fields);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Invalid input", details: parsed.error.flatten() },
          { status: 400 },
        );
      }
      body = parsed.data;

      const file = form.get("file");
      if (file && file instanceof File && file.size > 0) {
        ingested = await ingestFile(file);
        if (ingested.image) {
          images.push({
            base64: ingested.image.base64,
            mediaType: ingested.image.mediaType,
            filename: ingested.filename,
          });
        }
        // If the user didn't pick an inputType explicitly, infer from the file.
        if (!body.inputType) body.inputType = ingested.inputType;
      }
    } else {
      const json = await req.json();
      const parsed = baseSchema.safeParse(json);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Invalid input", details: parsed.error.flatten() },
          { status: 400 },
        );
      }
      body = parsed.data;
    }
  } catch (err) {
    if (err instanceof FileIngestError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: 400 },
      );
    }
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not parse request body.",
      },
      { status: 400 },
    );
  }

  const composedRawInput = composeRawInput(body.rawInput, ingested);
  if (composedRawInput.trim().length < 10 && images.length === 0) {
    return NextResponse.json(
      { error: "Please paste at least a sentence or attach a file with content." },
      { status: 400 },
    );
  }

  const result = await createAndAnalyzeCase({
    rawInput: composedRawInput,
    customerName: body.customerName || null,
    customerEmail: body.customerEmail || null,
    inputType: body.inputType,
    businessCategory: body.businessCategory ?? null,
    images: images.length > 0 ? images : undefined,
  });

  return NextResponse.json({
    caseId: result.caseId,
    source: result.outcome.source,
    guardrailReasons: result.outcome.guardrailReasons,
    ingested: ingested
      ? { filename: ingested.filename, kind: ingested.image ? "image" : "text" }
      : null,
  });
}
