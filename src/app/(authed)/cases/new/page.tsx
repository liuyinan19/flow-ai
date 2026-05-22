import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewCaseForm } from "@/components/new-case-form";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export default function NewCasePage() {
  return (
    <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-caption text-[rgba(var(--text)/0.6)] hover:text-[rgb(var(--text))]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to dashboard
      </Link>
      <div className="mt-4 max-w-3xl">
        <PageHeader
          title="Analyze a new case"
          subtitle="Paste a messy customer message below. The agent will classify it, extract structured facts, draft a reply, generate a task checklist, and decide whether it needs a human reviewer."
        />
      </div>
      <div className="max-w-3xl">
        <NewCaseForm />
      </div>
    </div>
  );
}
