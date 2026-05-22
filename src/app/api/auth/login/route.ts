import { NextResponse } from "next/server";
import { z } from "zod";
import {
  AUTH_COOKIE,
  SESSION_COOKIE_OPTIONS,
  checkCredentials,
  signSession,
} from "@/lib/auth";
import {
  clientIp,
  makeRateLimitResponse,
  rateLimit,
} from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  user: z.string().min(1).max(128),
  pass: z.string().min(1).max(256),
});

export async function POST(req: Request) {
  // Tighter rate limit on login than on the LLM endpoints — 6/min per IP.
  const limit = rateLimit(`login:${clientIp(req)}`, {
    capacity: 6,
    refillPerSecond: 6 / 60,
  });
  if (!limit.allowed) return makeRateLimitResponse(limit.retryAfterSec);

  let body: { user: string; pass: string };
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "Username and password required." },
      { status: 400 },
    );
  }

  if (!checkCredentials(body.user, body.pass)) {
    return NextResponse.json(
      { error: "Invalid credentials." },
      { status: 401 },
    );
  }

  const token = await signSession(body.user);
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: AUTH_COOKIE,
    value: token,
    ...SESSION_COOKIE_OPTIONS,
  });
  return res;
}

// Use the default rate-limit fallback for other methods.
export async function GET() {
  return NextResponse.json(
    { error: "POST { user, pass } to sign in." },
    { status: 405 },
  );
}
