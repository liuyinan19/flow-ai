/**
 * Public-credential demo auth.
 *
 * Threat model: this gates the portfolio deployment behind a single shared
 * credential that's visible on the login page. The goal isn't to keep humans
 * out — recruiters click Sign in and proceed. The goal is to:
 *
 *   1. Stop drive-by crawlers and bots from hitting LLM-spending endpoints.
 *   2. Demonstrate the auth pattern (HMAC-signed cookies, constant-time
 *      compare, httpOnly + secure + SameSite, expiring sessions) without
 *      shipping a real user system.
 *
 * Web Crypto only — runs on the edge middleware AND in node API routes.
 */

const TEXT = new TextEncoder();
const SESSION_MAX_AGE_S = 30 * 24 * 60 * 60; // 30 days
const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_S * 1000;

export const AUTH_COOKIE = "flow-ai-auth";

export const DEMO_AUTH_USER = process.env.DEMO_AUTH_USER ?? "recruiter";
export const DEMO_AUTH_PASS = process.env.DEMO_AUTH_PASS ?? "flow-ai-demo";
const AUTH_SECRET =
  process.env.AUTH_SECRET ??
  "dev-only-secret-set-AUTH_SECRET-in-prod-to-rotate-sessions";

/** Constant-time string compare via Web Crypto's subtle layer. */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export function checkCredentials(user: string, pass: string): boolean {
  return (
    constantTimeEqual(user, DEMO_AUTH_USER) &&
    constantTimeEqual(pass, DEMO_AUTH_PASS)
  );
}

async function hmacHex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    TEXT.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, TEXT.encode(payload));
  const bytes = new Uint8Array(sig);
  let hex = "";
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  return hex;
}

/** `<user>.<issuedAtMs>.<hmac>` */
export async function signSession(user: string): Promise<string> {
  const payload = `${user}.${Date.now()}`;
  const sig = await hmacHex(AUTH_SECRET, payload);
  return `${payload}.${sig}`;
}

export async function verifySession(token: string | undefined): Promise<
  | { ok: true; user: string }
  | { ok: false; reason: "missing" | "malformed" | "expired" | "bad_sig" }
> {
  if (!token) return { ok: false, reason: "missing" };
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, reason: "malformed" };
  const [user, tsStr, sig] = parts;
  const ts = Number(tsStr);
  if (!Number.isFinite(ts)) return { ok: false, reason: "malformed" };
  if (Date.now() - ts > SESSION_MAX_AGE_MS) {
    return { ok: false, reason: "expired" };
  }
  const expected = await hmacHex(AUTH_SECRET, `${user}.${tsStr}`);
  if (!constantTimeEqual(sig, expected)) {
    return { ok: false, reason: "bad_sig" };
  }
  return { ok: true, user };
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE_S,
};

/** Paths that bypass the auth gate. */
export const PUBLIC_PATH_PATTERNS = [
  /^\/login$/,
  /^\/api\/auth\/login$/,
  /^\/api\/auth\/logout$/,
  /^\/favicon/,
  /^\/_next\//,
  /^\/.*\.(svg|png|jpg|jpeg|gif|ico|webp|css|js|map|txt)$/,
];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATH_PATTERNS.some((rx) => rx.test(pathname));
}
