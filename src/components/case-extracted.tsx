import { Calendar, DollarSign, ListTree, Mail, Tag, UserCircle2, AlertCircle } from "lucide-react";
import type { ExtractedData } from "@/lib/types";

export function CaseExtracted({ data }: { data: ExtractedData | null }) {
  if (!data) {
    return (
      <p className="text-sm text-muted-foreground">
        No extracted data yet — analyze the case first.
      </p>
    );
  }
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Block title="Customer intent" icon={<Tag className="h-4 w-4" />}>
        <p className="text-sm">{data.customerIntent || "—"}</p>
      </Block>
      <Block title="Key facts" icon={<ListTree className="h-4 w-4" />}>
        <List items={data.keyFacts} />
      </Block>
      <Block title="Entities" icon={<UserCircle2 className="h-4 w-4" />}>
        <KeyValue obj={data.entities} />
      </Block>
      <Block title="Contact info" icon={<Mail className="h-4 w-4" />}>
        <KeyValue obj={data.contactInfo} />
      </Block>
      <Block title="Deadlines" icon={<Calendar className="h-4 w-4" />}>
        <List items={data.deadlines} />
      </Block>
      <Block title="Money amounts" icon={<DollarSign className="h-4 w-4" />}>
        <List items={data.moneyAmounts} />
      </Block>
      <Block
        title="Missing information"
        icon={<AlertCircle className="h-4 w-4 text-amber-500" />}
        className="lg:col-span-2"
      >
        <List items={data.missingInformation} tone="warning" />
      </Block>
    </div>
  );
}

function Block({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-border bg-card p-4 ${className ?? ""}`}>
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

function List({
  items,
  tone,
}: {
  items: string[];
  tone?: "default" | "warning";
}) {
  if (!items || items.length === 0) {
    return <p className="text-xs text-muted-foreground">—</p>;
  }
  return (
    <ul className="space-y-1.5 text-sm">
      {items.map((it, i) => (
        <li
          key={i}
          className={`flex items-start gap-2 ${
            tone === "warning"
              ? "text-amber-700 dark:text-amber-300"
              : ""
          }`}
        >
          <span className="mt-1.5 inline-block h-1 w-1 rounded-full bg-current opacity-60" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function KeyValue({ obj }: { obj: Record<string, string> }) {
  const entries = Object.entries(obj ?? {});
  if (entries.length === 0) {
    return <p className="text-xs text-muted-foreground">—</p>;
  }
  return (
    <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1.5 text-sm">
      {entries.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            {k}
          </dt>
          <dd className="text-sm">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
