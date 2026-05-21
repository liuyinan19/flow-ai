export default function CaseDetailLoading() {
  return (
    <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
      <div className="h-3 w-32 animate-pulse rounded-md bg-[rgba(var(--text)/0.06)]" />
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="space-y-2">
          <div className="h-9 w-96 animate-pulse rounded-md bg-[rgba(var(--text)/0.08)]" />
          <div className="h-3 w-72 animate-pulse rounded-md bg-[rgba(var(--text)/0.06)]" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-32 animate-pulse rounded-full bg-[rgba(var(--text)/0.06)]" />
          <div className="h-9 w-32 animate-pulse rounded-full bg-[rgba(var(--text)/0.06)]" />
        </div>
      </div>
      <div className="mt-6 h-9 w-[36rem] max-w-full animate-pulse rounded-full bg-[rgba(var(--text)/0.05)]" />
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-3xl bg-[rgba(var(--text)/0.05)]"
            />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-3xl bg-[rgba(var(--text)/0.05)]" />
      </div>
    </div>
  );
}
