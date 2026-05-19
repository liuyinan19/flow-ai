"use client";

import { AnimatePresence } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { MDiv, premiumEase } from "@/components/motion";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "focus-ring pressable relative grid h-10 w-10 place-items-center rounded-full transition-colors",
        "bg-[rgba(var(--text)/0.05)] hover:bg-[rgba(var(--text)/0.08)]",
        "text-[rgb(var(--text))]",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <MDiv
          key={isDark ? "moon" : "sun"}
          initial={{ opacity: 0, scale: 0.7, rotate: -45 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.7, rotate: 45 }}
          transition={{ duration: 0.2, ease: premiumEase }}
          className="grid place-items-center"
        >
          {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </MDiv>
      </AnimatePresence>
    </button>
  );
}
