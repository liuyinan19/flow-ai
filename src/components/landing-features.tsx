"use client";

import type { LucideIcon } from "lucide-react";
import {
  Tags,
  Database,
  ListChecks,
  Mails,
  Workflow,
  ShieldAlert,
} from "lucide-react";
import {
  MDiv,
  containerVariants,
  itemVariants,
  liquidSpring,
} from "@/components/motion";

interface Feature {
  title: string;
  body: string;
  icon: LucideIcon;
}

const FEATURES: Feature[] = [
  {
    title: "Classify incoming requests",
    body: "Sort messy customer input into Support, Sales, Billing, Legal, Ops, or HR — with an explainable reason for every decision.",
    icon: Tags,
  },
  {
    title: "Extract structured data",
    body: "Pull entities, deadlines, dollar amounts, contact info, and missing-information gaps from any chunk of text.",
    icon: Database,
  },
  {
    title: "Generate task checklists",
    body: "Convert each case into actionable, team-owned tasks ready to drop into your existing project tracker.",
    icon: ListChecks,
  },
  {
    title: "Draft customer responses",
    body: "Write professional, calm, on-brand replies that never overpromise — ready for one-click human approval.",
    icon: Mails,
  },
  {
    title: "Route to the right team",
    body: "Pick the correct owning team, with a confidence score and a classification rationale on every case.",
    icon: Workflow,
  },
  {
    title: "Flag risky cases for review",
    body: "Refunds, legal threats, compliance flags, and low-confidence outputs are automatically held for a human.",
    icon: ShieldAlert,
  },
];

export function LandingFeatures() {
  return (
    <MDiv
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {FEATURES.map((feature) => (
        <MDiv
          key={feature.title}
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.005 }}
          transition={liquidSpring}
          className="card-glass grain p-5"
        >
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(var(--text)/0.08)] bg-[rgba(var(--text)/0.04)]">
            <feature.icon className="h-4 w-4 text-[rgb(var(--accent))]" />
          </div>
          <h3 className="text-body-lg font-semibold tracking-tight">
            {feature.title}
          </h3>
          <p className="mt-1.5 text-body-sm text-[rgba(var(--text)/0.7)]">
            {feature.body}
          </p>
        </MDiv>
      ))}
    </MDiv>
  );
}
