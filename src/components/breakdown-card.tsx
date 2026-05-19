"use client";

import { MDiv, premiumEase } from "@/components/motion";

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
    <div className="card-glass grain p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-body-sm font-semibold tracking-tight">{title}</h3>
        <span className="text-overline uppercase tracking-wide text-[rgba(var(--text)/0.5)]">
          {filtered.length} categor{filtered.length === 1 ? "y" : "ies"}
        </span>
      </div>
      {filtered.length === 0 ? (
        <p className="text-caption text-[rgba(var(--text)/0.55)]">
          No data yet.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((item, i) => (
            <li key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-caption">
                <span className="font-medium capitalize">
                  {item.label.toLowerCase().replace(/_/g, " ")}
                </span>
                <span className="tabular-nums text-[rgba(var(--text)/0.65)]">
                  {item.count}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(var(--text)/0.06)]">
                <MDiv
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.count / max) * 100}%` }}
                  transition={{
                    duration: 0.6,
                    ease: premiumEase,
                    delay: i * 0.04,
                  }}
                  className="h-full rounded-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent2))]"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
