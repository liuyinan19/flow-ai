import * as React from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-heading-1 font-bold tracking-tight">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-body-sm text-[rgba(var(--text)/0.65)] max-w-2xl">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
