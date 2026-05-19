interface BreakdownItem {
  label: string;
  count: number;
}

export function BreakdownCard({
  title,
  items,
}: {
  title: string;
  items: BreakdownItem[];
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  const filtered = items.filter((i) => i.count > 0);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        <span className="text-xs text-muted-foreground">
          {filtered.length} categor{filtered.length === 1 ? "y" : "ies"}
        </span>
      </div>
      {filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground">No data yet.</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((item) => (
            <li key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium capitalize">
                  {item.label.toLowerCase().replace(/_/g, " ")}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {item.count}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-foreground/70"
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
