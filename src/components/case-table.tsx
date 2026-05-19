import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
        <p className="text-sm font-medium">No cases yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Cases you analyze will appear here. Submit one from{" "}
          <Link
            href="/cases/new"
            className="font-medium underline-offset-4 hover:underline"
          >
            /cases/new
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[260px]">Title</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((c) => (
            <TableRow key={c.id} className="cursor-pointer">
              <TableCell className="font-medium">
                <Link
                  href={`/cases/${c.id}`}
                  className="hover:underline underline-offset-4"
                >
                  {c.title}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                <div className="leading-tight">
                  <div>{c.customerName ?? "—"}</div>
                  {c.customerEmail ? (
                    <div className="text-xs">{c.customerEmail}</div>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="text-xs uppercase tracking-wide text-muted-foreground">
                {c.requestType ? (
                  <span>{(c.requestType as RequestType).toLowerCase()}</span>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                {c.priority ? (
                  <PriorityPill priority={c.priority as PriorityType} />
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                <ConfidenceBar value={c.confidence} />
              </TableCell>
              <TableCell>
                <StatusPill status={c.status as CaseStatus} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {c.assignedTeam ?? "—"}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatDistanceToNow(c.createdAt, { addSuffix: true })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
