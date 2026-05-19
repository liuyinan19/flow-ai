import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewCaseForm } from "@/components/new-case-form";

export const dynamic = "force-dynamic";

export default function NewCasePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to dashboard
      </Link>
      <div className="mt-4">
        <h1 className="text-2xl font-semibold tracking-tight">Analyze a new case</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste a messy customer message below. The agent will classify it, extract structured
          facts, draft a reply, generate a task checklist, and decide whether it needs a human
          reviewer.
        </p>
      </div>

      <div className="mt-8">
        <NewCaseForm />
      </div>
    </div>
  );
}
