/**
 * File ingest — read uploaded files into either text (concatenated to rawInput)
 * or a base64 image (sent to Claude as a multimodal content block).
 *
 * Limits enforced here:
 *   - max 5 MB per file
 *   - allowlisted MIME types only
 *
 * Anything that isn't recognized is rejected with a clear error message rather
 * than silently dropped.
 */

import mammoth from "mammoth";

export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

const TEXT_MIMES = new Set([
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "text/html",
  "application/xml",
  "text/xml",
]);

const IMAGE_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);

const PDF_MIME = "application/pdf";
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export interface FileIngestResult {
  /** Extracted text content to fold into the user prompt. Empty for pure-image files. */
  text: string;
  /** Optional base64-encoded image (data URI prefix stripped) for Claude vision. */
  image?: {
    base64: string;
    mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
  };
  /** Original filename, for prompt context and the activity log. */
  filename: string;
  /** Inferred input type for the Case row. */
  inputType: "TEXT" | "FILE" | "SCREENSHOT" | "VOICE";
}

export class FileIngestError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "too_large"
      | "unsupported_type"
      | "parse_failed"
      | "empty",
  ) {
    super(message);
    this.name = "FileIngestError";
  }
}

export async function ingestFile(file: File): Promise<FileIngestResult> {
  if (file.size === 0) {
    throw new FileIngestError("File is empty.", "empty");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new FileIngestError(
      `File is ${(file.size / 1024 / 1024).toFixed(1)} MB — limit is 5 MB.`,
      "too_large",
    );
  }

  const mime = (file.type || "").toLowerCase();

  if (TEXT_MIMES.has(mime) || mime.startsWith("text/")) {
    const text = await file.text();
    return {
      text: text.trim(),
      filename: file.name,
      inputType: "FILE",
    };
  }

  if (mime === PDF_MIME) {
    const buf = Buffer.from(await file.arrayBuffer());
    try {
      // pdf-parse v2 ships a class-based API; dynamic import keeps it off the
      // edge bundle and prevents the legacy v1 module's startup file read from
      // firing in environments where it would 500.
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buf });
      const result = await parser.getText();
      const text = (result.text || "").trim();
      if (!text) {
        throw new FileIngestError(
          "PDF parsed but contained no extractable text. If it's a scanned image, upload it as PNG/JPG so vision can read it.",
          "parse_failed",
        );
      }
      return { text, filename: file.name, inputType: "FILE" };
    } catch (err) {
      if (err instanceof FileIngestError) throw err;
      throw new FileIngestError(
        `Could not parse PDF: ${err instanceof Error ? err.message : "unknown error"}.`,
        "parse_failed",
      );
    }
  }

  if (mime === DOCX_MIME) {
    const buf = Buffer.from(await file.arrayBuffer());
    try {
      const { value } = await mammoth.extractRawText({ buffer: buf });
      const text = (value || "").trim();
      if (!text) {
        throw new FileIngestError("DOCX has no readable text.", "parse_failed");
      }
      return { text, filename: file.name, inputType: "FILE" };
    } catch (err) {
      if (err instanceof FileIngestError) throw err;
      throw new FileIngestError(
        `Could not parse DOCX: ${err instanceof Error ? err.message : "unknown error"}.`,
        "parse_failed",
      );
    }
  }

  if (IMAGE_MIMES.has(mime)) {
    const buf = Buffer.from(await file.arrayBuffer());
    const base64 = buf.toString("base64");
    return {
      text: "",
      image: {
        base64,
        mediaType: normalizeImageMime(mime),
      },
      filename: file.name,
      inputType: "SCREENSHOT",
    };
  }

  throw new FileIngestError(
    `Unsupported file type "${mime || "unknown"}". Supported: text, PDF, DOCX, PNG/JPG/WEBP/GIF.`,
    "unsupported_type",
  );
}

function normalizeImageMime(
  mime: string,
): "image/png" | "image/jpeg" | "image/webp" | "image/gif" {
  if (mime === "image/jpg") return "image/jpeg";
  if (
    mime === "image/png" ||
    mime === "image/jpeg" ||
    mime === "image/webp" ||
    mime === "image/gif"
  ) {
    return mime;
  }
  return "image/png";
}

/**
 * Compose the final rawInput from a pasted prompt + an ingested file.
 * Keeps the original text on top and appends an ATTACHED FILE block so the
 * model can reason about which lines came from where.
 */
export function composeRawInput(
  pasted: string,
  ingested: FileIngestResult | null,
): string {
  const trimmedPasted = (pasted || "").trim();
  if (!ingested) return trimmedPasted;

  const parts: string[] = [];
  if (trimmedPasted) {
    parts.push(trimmedPasted);
    parts.push("");
  }
  parts.push(`--- ATTACHED FILE: ${ingested.filename} ---`);
  if (ingested.image) {
    parts.push(
      "(Image attached — see vision content block for the actual screenshot.)",
    );
  } else if (ingested.text) {
    parts.push(ingested.text);
  } else {
    parts.push("(File had no extractable text.)");
  }
  parts.push("--- END ATTACHED FILE ---");
  return parts.join("\n");
}
