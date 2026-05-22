import { Suspense } from "react";
import { Sparkles, ShieldCheck } from "lucide-react";
import { DEMO_AUTH_USER, DEMO_AUTH_PASS } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export const metadata = {
  title: "Sign in — AI Operations Agent",
};

// This page is publicly accessible — the credentials are intentionally
// rendered on the form so recruiters / interviewers can sign in with one
// click. Anything behind the login is portfolio-demo data only.
export default function LoginPage() {
  return (
    <div className="relative isolate flex min-h-[80vh] items-center justify-center px-5 py-10 sm:px-8">
      <div className="absolute -top-32 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-[rgba(var(--accent)/0.18)] blur-[140px]" />
      <div className="absolute bottom-0 right-0 -z-10 h-72 w-72 rounded-full bg-[rgba(var(--accent2)/0.12)] blur-[120px]" />

      <div className="card-glass grain w-full max-w-md p-8">
        <div className="flex items-center gap-2">
          <span className="inline-grid h-8 w-8 place-items-center rounded-xl bg-[rgb(28,25,45)] text-white dark:bg-white/95 dark:text-[rgb(28,25,45)]">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-overline uppercase tracking-wide text-[rgba(var(--text)/0.6)]">
            AI Operations Agent
          </span>
        </div>

        <h1 className="mt-5 text-heading-2 font-semibold tracking-tight">
          Sign in to the demo
        </h1>
        <p className="mt-1 text-body-sm text-[rgba(var(--text)/0.7)]">
          Portfolio deployment of Flow AI. Credentials are pre-filled — just
          click <span className="font-semibold text-[rgb(var(--text))]">Sign in</span>{" "}
          to explore the agent, dashboard, and live evaluation harness.
        </p>

        <Suspense fallback={<div className="mt-6 h-32 animate-pulse rounded-2xl bg-[rgba(var(--text)/0.06)]" />}>
          <LoginForm
            initialUser={DEMO_AUTH_USER}
            initialPass={DEMO_AUTH_PASS}
          />
        </Suspense>

        <div className="mt-6 flex items-start gap-2 rounded-2xl border border-[rgba(var(--accent)/0.20)] bg-[rgba(var(--accent)/0.06)] p-3 text-caption">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[rgb(var(--accent))]" />
          <p className="text-[rgba(var(--text)/0.75)]">
            <span className="font-semibold text-[rgb(var(--text))]">
              About this gate.
            </span>{" "}
            HMAC-signed httpOnly session cookie, 30-day expiry, per-IP rate
            limit on the login route. No real user data lives behind it — the
            seeded cases are public demo fixtures.
          </p>
        </div>
      </div>
    </div>
  );
}
