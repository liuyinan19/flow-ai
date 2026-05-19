"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import * as React from "react";
import { cn } from "@/lib/utils";

export const MDiv = motion.div;
export const MButton = motion.button;
export const MSpan = motion.span;
export const MSection = motion.section;
export const MUl = motion.ul;
export const MLi = motion.li;
export const MA = motion.a;

// Lumina's signature easing curve.
export const premiumEase = [0.22, 1, 0.36, 1] as const;

// Lumina's signature spring — used for hover lifts, card transitions, tooltips.
export const liquidSpring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 25,
  mass: 1,
};

// Faster spring for buttons / quick taps.
export const snappySpring = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

/**
 * Premium button — hover lifts, tap presses, spring transitions.
 * Pure styling wrapper; pass any className/onClick.
 */
type PremiumButtonProps = HTMLMotionProps<"button"> & {
  className?: string;
};

export function PremiumButton({ children, className, ...props }: PremiumButtonProps) {
  return (
    <MButton
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={liquidSpring}
      className={cn("cursor-pointer", className)}
      {...props}
    >
      {children}
    </MButton>
  );
}

// Staggered fade-in variants for lists / grids.
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: premiumEase },
  },
};
