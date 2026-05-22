import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/glass-card";
import { LandingFeatures } from "@/components/landing-features";

export default function Home() {
  return (
    <div className="px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
      <section className="relative">
        <div className="absolute -top-10 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[rgba(var(--accent)/0.25)] blur-[120px]" />
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--text)/0.08)] bg-[rgba(var(--text)/0.04)] px-3 py-1 text-overline uppercase tracking-wide text-[rgba(var(--text)/0.65)]">
            <Sparkles className="h-3.5 w-3.5" />
            Production-minded AI workflow automation
          </div>
          <h1 className="mt-6 text-balance text-[44px] sm:text-[64px] font-bold tracking-tight leading-[1.05]">
            Turn{" "}
            <span className="text-gradient-brand">messy business requests</span>
            <br />
            into structured actions.
          </h1>
          <p className="mt-6 text-balance text-body-lg text-[rgba(var(--text)/0.7)]">
            AI Operations Agent classifies inbound requests, extracts the facts
            that matter, drafts a customer response, and creates a task
            checklist your team can actually run — with humans in the loop on
            every risky case.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="btn-exchange focus-ring pressable"
            >
              Try the demo
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
            <Link
              href="/cases/new"
              className="focus-ring pressable inline-flex h-11 items-center justify-center rounded-full border border-[rgba(var(--text)/0.12)] bg-[rgba(var(--text)/0.04)] px-6 text-sm font-semibold backdrop-blur hover:bg-[rgba(var(--text)/0.08)]"
            >
              Submit a case
            </Link>
            <Link
              href="/evaluations"
              className="focus-ring pressable inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold text-[rgba(var(--text)/0.7)] hover:text-[rgb(var(--text))]"
            >
              See evaluations
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-16 sm:mt-20">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-heading-2 font-semibold tracking-tight">
            What the agent does, end-to-end
          </h2>
          <p className="mt-2 text-body-sm text-[rgba(var(--text)/0.65)]">
            Designed around how Forward Deployed teams actually deliver AI in
            production — explainable, safe, and human-supervised.
          </p>
        </div>
        <LandingFeatures />
      </section>

      <section className="mt-16">
        <GlassCard className="mx-auto max-w-3xl text-center" padded>
          <h3 className="text-heading-3 font-semibold tracking-tight">
            Ready to see it in action?
          </h3>
          <p className="mt-2 text-body-sm text-[rgba(var(--text)/0.7)]">
            Run a pre-built demo case to watch the full pipeline — reading,
            classifying, extracting, routing, drafting, and flagging — in one
            click.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/dashboard" className="btn-exchange focus-ring pressable">
              Open dashboard
            </Link>
            <Link
              href="/cases/new"
              className="focus-ring pressable inline-flex h-11 items-center justify-center rounded-full border border-[rgba(var(--text)/0.12)] bg-[rgba(var(--text)/0.04)] px-6 text-sm font-semibold backdrop-blur hover:bg-[rgba(var(--text)/0.08)]"
            >
              Analyze a request
            </Link>
          </div>
        </GlassCard>
      </section>

      <footer className="mt-12 pb-2 text-center text-caption text-[rgba(var(--text)/0.5)]">
        AI Operations Agent — portfolio demo. Built with Next.js, Prisma, Neon,
        and Claude.
      </footer>
    </div>
  );
}
