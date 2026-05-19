import * as React from "react";
import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className,
  padded = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { padded?: boolean }) {
  return (
    <div
      className={cn(
        "card-glass grain",
        padded && "p-5 sm:p-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function GlassSurface({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass grain rounded-3xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
