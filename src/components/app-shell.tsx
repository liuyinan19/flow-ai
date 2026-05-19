import { SidebarNav } from "@/components/sidebar-nav";

/**
 * Lumina-style outer shell: rounded-3xl container with a fixed icon sidebar
 * on the left and a flexible content section on the right.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen p-3 sm:p-4 lg:p-6">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 overflow-hidden rounded-3xl border border-[rgba(var(--text)/0.06)] bg-[rgba(var(--bgB)/0.4)] backdrop-blur-xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.25)] md:grid-cols-[72px_1fr] lg:grid-cols-[84px_1fr]">
        <SidebarNav />
        <section className="min-h-[calc(100vh-2rem)] border-t border-[rgba(var(--text)/0.06)] md:border-l md:border-t-0">
          {children}
        </section>
      </div>
    </main>
  );
}
