"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGroup,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
  type MotionValue,
} from "framer-motion";
import {
  LayoutDashboard,
  PlusCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { TooltipSide } from "@/components/tooltip-side";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "@/components/sign-out-button";
import { cn } from "@/lib/utils";

const M = motion;

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    href: "/cases/new",
    label: "New case",
    icon: <PlusCircle className="h-5 w-5" />,
  },
  {
    href: "/evaluations",
    label: "Evaluations",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/cases/new") return pathname === "/cases/new";
  if (href === "/dashboard") {
    // Dashboard "owns" case detail pages but not the new-case form.
    return (
      pathname.startsWith("/dashboard") ||
      (pathname.startsWith("/cases/") && pathname !== "/cases/new")
    );
  }
  return pathname.startsWith(href);
}

export function SidebarNav() {
  const pathname = usePathname();
  const activeIndex = ITEMS.findIndex((it) => isActive(pathname, it.href));
  const [prevIndex, setPrevIndex] = React.useState(activeIndex);

  const scale = useMotionValue(1);
  const smoothScale = useSpring(scale, {
    stiffness: 400,
    damping: 20,
    mass: 0.8,
  });

  const direction = activeIndex > prevIndex ? 1 : -1;

  React.useEffect(() => {
    if (activeIndex !== prevIndex && activeIndex !== -1) {
      const sequence = async () => {
        await animate(scale, 0.92, { duration: 0.08, ease: [0.4, 0, 1, 1] });
        await animate(scale, 1.06, { duration: 0.12, ease: [0, 0, 0.2, 1] });
        animate(scale, 1, {
          type: "spring",
          stiffness: 400,
          damping: 15,
          mass: 0.6,
        });
      };
      void sequence();
      // Tracking which index was last active so the next change knows its
      // direction — intentional state-in-effect to mirror route changes.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPrevIndex(activeIndex);
    }
  }, [activeIndex, prevIndex, scale]);

  return (
    <aside className="hidden md:flex md:w-[72px] lg:w-[84px] shrink-0 flex-col items-center gap-3 py-6">
      <Link
        href="/"
        aria-label="AI Operations Agent — home"
        className="focus-ring pressable grid h-10 w-10 place-items-center rounded-2xl bg-[rgb(28,25,45)] text-white dark:bg-white/95 dark:text-[rgb(28,25,45)]"
      >
        <Sparkles className="h-4 w-4" />
      </Link>

      <LayoutGroup id="sidebar-nav">
        <div className="relative flex flex-col items-center gap-2">
          {ITEMS.map((item, i) => (
            <SidebarButton
              key={item.href}
              item={item}
              active={i === activeIndex}
              smoothScale={smoothScale}
              direction={direction}
            />
          ))}
        </div>
      </LayoutGroup>

      <div className="mt-auto flex flex-col items-center gap-2">
        <ThemeToggle />
        <SignOutButton />
      </div>
    </aside>
  );
}

function SidebarButton({
  item,
  active,
  smoothScale,
  direction,
}: {
  item: NavItem;
  active: boolean;
  smoothScale: MotionValue<number>;
  direction: number;
}) {
  const skewY = useTransform(
    smoothScale,
    [0.92, 1, 1.06],
    [direction * -4, 0, direction * 3],
  );
  const scaleX = useTransform(smoothScale, [0.92, 1, 1.06], [1.08, 1, 0.96]);
  const scaleY = useTransform(smoothScale, [0.92, 1, 1.06], [0.94, 1, 1.05]);

  return (
    <TooltipSide label={item.label}>
      <Link
        href={item.href}
        aria-label={item.label}
        aria-current={active ? "page" : undefined}
        className="focus-ring pressable relative grid h-12 w-12 place-items-center rounded-2xl"
      >
        {active && (
          <>
            <M.div
              layoutId="sidebarActiveIndicator"
              className="absolute inset-0 rounded-2xl"
              style={{
                scaleX,
                scaleY,
                skewY,
                background:
                  "linear-gradient(135deg, rgba(139,133,255,0.55) 0%, rgba(168,162,255,0.50) 50%, rgba(255,214,107,0.35) 100%)",
                border: "1px solid rgba(168,162,255,0.40)",
                boxShadow:
                  "0 8px 24px -8px rgba(168,162,255,0.45), 0 2px 8px -2px rgba(255,214,107,0.20), inset 0 1px 0 rgba(255,255,255,0.12)",
              }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 25,
                mass: 0.8,
                layout: {
                  type: "spring",
                  stiffness: 280,
                  damping: 22,
                  mass: 1,
                },
              }}
            >
              <M.div
                className="absolute inset-0 overflow-hidden rounded-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.08, duration: 0.15 }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 40%)",
                  }}
                />
              </M.div>
            </M.div>
            <M.div
              className="absolute -inset-1 -z-10 rounded-[20px]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background:
                  "radial-gradient(circle at center, rgba(168,162,255,0.15) 0%, transparent 70%)",
              }}
            />
          </>
        )}
        <M.span
          className={cn(
            "relative z-10 transition-colors duration-200",
            active
              ? "text-white"
              : "text-[rgba(var(--text)/0.7)] hover:text-[rgb(var(--text))]",
          )}
          animate={
            active
              ? { scale: [1, 1.08, 0.98, 1] }
              : { scale: 1 }
          }
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
            times: [0, 0.3, 0.7, 1],
          }}
        >
          {item.icon}
        </M.span>
      </Link>
    </TooltipSide>
  );
}
