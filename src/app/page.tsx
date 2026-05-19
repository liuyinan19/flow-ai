import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Tags,
  ListChecks,
  Mails,
  Workflow,
  ShieldAlert,
  Database,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Classify incoming requests",
    body: "Sort messy customer input into Support, Sales, Billing, Legal, Ops, or HR — with an explainable reason for every decision.",
    icon: Tags,
  },
  {
    title: "Extract structured data",
    body: "Pull entities, deadlines, dollar amounts, contact info, and missing-information gaps from any chunk of text.",
    icon: Database,
  },
  {
    title: "Generate task checklists",
    body: "Convert each case into actionable, team-owned tasks ready to drop into your existing project tracker.",
    icon: ListChecks,
  },
  {
    title: "Draft customer responses",
    body: "Write professional, calm, on-brand replies that never overpromise — ready for one-click human approval.",
    icon: Mails,
  },
  {
    title: "Route to the right team",
    body: "Pick the correct owning team, with a confidence score and a classification rationale on every case.",
    icon: Workflow,
  },
  {
    title: "Flag risky cases for review",
    body: "Refunds, legal threats, compliance flags, and low-confidence outputs are automatically held for a human.",
    icon: ShieldAlert,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="border-b border-border bg-gradient-to-b from-background to-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Production-minded AI workflow automation
            </div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
              Turn messy business requests into structured actions.
            </h1>
            <p className="mt-6 text-balance text-lg text-muted-foreground sm:text-xl">
              AI Operations Agent classifies inbound requests, extracts the
              facts that matter, drafts a customer response, and creates a task
              checklist your team can actually run — with humans in the loop on
              every risky case.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }))}>
                Try demo <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
              <Link
                href="/cases/new"
                className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
              >
                Submit a case
              </Link>
              <Link
                href="/evaluations"
                className={cn(buttonVariants({ size: "lg", variant: "ghost" }))}
              >
                See evaluations
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            What the agent does, end-to-end
          </h2>
          <p className="mt-3 text-muted-foreground">
            Designed around how Forward Deployed teams actually deliver AI in
            production — explainable, safe, and human-supervised.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border/70">
              <CardHeader>
                <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted/50">
                  <feature.icon className="h-4 w-4" />
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
                <CardDescription>{feature.body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-16 text-center sm:px-6 lg:px-8">
          <h3 className="text-2xl font-semibold tracking-tight">
            Ready to see it in action?
          </h3>
          <p className="max-w-xl text-muted-foreground">
            Run a pre-built demo case to watch the full pipeline — reading,
            classifying, extracting, routing, drafting, and flagging — in one
            click.
          </p>
          <div className="mt-2 flex gap-3">
            <Link href="/dashboard" className={cn(buttonVariants())}>
              Open dashboard
            </Link>
            <Link
              href="/cases/new"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Analyze a request
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>AI Operations Agent — portfolio demo, not a real product.</p>
          <p>Built with Next.js, Prisma, and Claude.</p>
        </div>
      </footer>
    </div>
  );
}
