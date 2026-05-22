export default function DashboardLoading() {
  return (
    <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div className="space-y-2">
          <div className="h-7 w-64 animate-pulse rounded-md bg-[rgba(var(--text)/0.08)]" />
          <div className="h-3 w-80 animate-pulse rounded-md bg-[rgba(var(--text)/0.06)]" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl bg-[rgba(var(--text)/0.05)]"
          />
        ))}
      </div>
      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-44 animate-pulse rounded-3xl bg-[rgba(var(--text)/0.05)]"
          />
        ))}
      </div>
      <div className="mt-8 h-96 animate-pulse rounded-3xl bg-[rgba(var(--text)/0.04)]" />
    </div>
  );
}
