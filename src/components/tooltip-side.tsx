"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** Lumina-style side tooltip that pops to the right of the trigger. */
export function TooltipSide({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <div
        className={cn(
          "pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2",
          "transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-1",
        )}
        aria-hidden
      >
        <div className="glass grain whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium">
          {label}
        </div>
      </div>
    </div>
  );
}
