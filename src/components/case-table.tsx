import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ChevronRight } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { PriorityPill } from "@/components/priority-pill";
import { ConfidenceBar } from "@/components/confidence-bar";
import type {
  CaseStatus,
  Priority as PriorityType,
  RequestType,
} from "@/lib/types";

interface CaseRow {
  id: string;
  title: string;
  customerName: string | null;
  customerEmail: string | null;
  requestType: string | null;
  priority: string | null;
  confidence: number | null;
  status: string;
  assignedTeam: string | null;
  createdAt: Date;
}

export function CaseTable({ cases }: { cases: CaseRow[] }) {
  if (cases.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[rgba(var(--text)/0.12)] bg-[rgba(var(--text)/0.02)] p-10 text-center">
        <p className="text-body-sm font-medium">No cases yet</p>
        <p className="mt-1 text-caption text-[rgba(var(--text)/0.6)]">
          Cases you analyze will appear here. Submit one from{" "}
          <Link
            href="/cases/new"
            className="font-medium text-[rgb(var(--accent))] underline-offset-4 hover:underline"
          >
            /cases/new
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-body-sm">
        <thead>
          <tr className="text-overline uppercase tracking-wide text-[rgba(var(--text)/0.55)]">
            <th className="px-3 py-2.5 text-left font-semibold">Title</th>
            <th className="px-3 py-2.5 text-left font-semibold">Customer</th>
            <th className="px-3 py-2.5 text-left font-semibold">Type</th>
            <th className="px-3 py-2.5 text-left font-semibold">Priority</th>
            <th className="px-3 py-2.5 text-left font-semibold">Confidence</th>
            <th className="px-3 py-2.5 text-left font-semibold">Status</th>
            <th className="px-3 py-2.5 text-left font-semibold">Team</th>
            <th className="px-3 py-2.5 text-left font-semibold">Created</th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr
              key={c.id}
              className="group border-t border-[rgba(var(--text)/0.06)] transition-colors hover:bg-[rgba(var(--text)/0.04)]"
            >
              <td className="px-3 py-3 font-medium">
                <Link
                  href={`/cases/${c.id}`}
                  className="hover:text-[rgb(var(--accent))]"
                >
                  {c.title}
                </Link>
              </td>
              <td className="px-3 py-3 text-[rgba(var(--text)/0.7)]">
                <div className="leading-tight">
                  <div>{c.customerName ?? "—"}</div>
                  {c.customerEmail ? (
                    <div className="text-caption text-[rgba(var(--text)/0.55)]">
                      {c.customerEmail}
                    </div>
                  ) : null}
                </div>
              </td>
              <td className="px-3 py-3 text-caption uppercase tracking-wide text-[rgba(var(--text)/0.65)]">
                {c.requestType ? (c.requestType as RequestType).toLowerCase() : "—"}
              </td>
              <td className="px-3 py-3">
                {c.priority ? (
                  <PriorityPill priority={c.priority as PriorityType} />
                ) : (
                  "—"
                )}
              </td>
              <td className="px-3 py-3">
                <ConfidenceBar value={c.confidence} />
              </td>
              <td className="px-3 py-3">
                <StatusPill status={c.status as CaseStatus} />
              </td>
              <td className="px-3 py-3 text-[rgba(var(--text)/0.7)]">
                {c.assignedTeam ?? "—"}
              </td>
              <td className="px-3 py-3 text-caption text-[rgba(var(--text)/0.55)]">
                {formatDistanceToNow(c.createdAt, { addSuffix: true })}
              </td>
              <td className="px-3 py-3 text-right">
                <Link
                  href={`/cases/${c.id}`}
                  className="inline-grid h-7 w-7 place-items-center rounded-full text-[rgba(var(--text)/0.5)] group-hover:text-[rgb(var(--accent))]"
                  aria-label="Open case"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
