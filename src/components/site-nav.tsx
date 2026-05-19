import Link from "next/link";
import { Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteNav() {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight">
            AI Operations Agent
          </span>
          <span className="hidden rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
            Demo
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Dashboard
          </Link>
          <Link
            href="/cases/new"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            New Case
          </Link>
          <Link
            href="/evaluations"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Evaluations
          </Link>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ size: "sm" }), "ml-2")}
          >
            Try Demo
          </Link>
        </nav>
      </div>
    </header>
  );
}
