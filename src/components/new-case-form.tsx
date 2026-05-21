"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles, UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlassCard } from "@/components/glass-card";
import { cn } from "@/lib/utils";

const SAMPLES: Record<string, string> = {
  refund:
    "I've been a customer for 14 months and your latest update broke our integration. We pay $12,000/year and lost two days of revenue. Refund our annual fee or we're switching to your competitor on Monday. -Devon, CTO @ Northwind",
  pricing:
    "Hi! I run platform engineering at Globex (around 800 engineers). Could you share enterprise pricing, SSO/SAML availability, SOC2 status, and a realistic implementation timeline? Ideally live by end of Q1.",
  legal:
    "I am exercising my right to erasure under GDPR Article 17. Please delete all personal data my company has stored, including backups, within 30 days. If not done, I will escalate to our DPO and the regulator. -Ana, Meadowlark GmbH",
};

const FIELD_INPUT_CLASS =
  "h-10 rounded-xl border-[rgba(var(--text)/0.1)] bg-[rgba(var(--text)/0.04)] focus-ring";

export function NewCaseForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [rawInput, setRawInput] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [inputType, setInputType] = useState("TEXT");
  const [file, setFile] = useState<File | null>(null);

  const applySample = (key: keyof typeof SAMPLES) => {
    setRawInput(SAMPLES[key]);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File too large — limit is 5 MB.");
      e.target.value = "";
      return;
    }
    setFile(f);
    // Infer input type from MIME so the right enum lands on the case row.
    if (f.type.startsWith("image/")) setInputType("SCREENSHOT");
    else setInputType("FILE");
    toast.success(
      f.type.startsWith("image/")
        ? `Image attached — Claude will read it directly.`
        : `${f.name} attached — text will be extracted and fed to the agent.`,
    );
  };

  const clearFile = () => {
    setFile(null);
    setInputType("TEXT");
  };

  const filenameLabel = file
    ? `${file.name} (${Math.round(file.size / 1024)} KB)`
    : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rawInput.trim().length < 10 && !file) {
      toast.error(
        "Paste at least a sentence or attach a file so the agent has something to work with.",
      );
      return;
    }
    setSubmitting(true);
    try {
      let res: Response;
      if (file) {
        // Multipart path — sends the file alongside text fields.
        const form = new FormData();
        form.append("rawInput", rawInput);
        if (customerName) form.append("customerName", customerName);
        if (customerEmail) form.append("customerEmail", customerEmail);
        if (businessCategory) form.append("businessCategory", businessCategory);
        form.append("inputType", inputType);
        form.append("file", file);
        res = await fetch("/api/cases/analyze", {
          method: "POST",
          body: form,
        });
      } else {
        res = await fetch("/api/cases/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rawInput,
            customerName: customerName || null,
            customerEmail: customerEmail || null,
            inputType,
            businessCategory: businessCategory || null,
          }),
        });
      }
      const json = await res.json();
      if (!res.ok || !json.caseId) {
        throw new Error(json.error ?? "Analysis failed.");
      }
      toast.success(
        json.ingested?.kind === "image"
          ? "Image analyzed by Claude vision."
          : json.ingested
            ? "File parsed and analyzed."
            : "Case analyzed.",
      );
      router.push(`/cases/${json.caseId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-5">
      <GlassCard padded>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="rawInput" className="text-body-sm font-semibold">
              Paste the customer&apos;s message
            </Label>
            <div className="flex flex-wrap gap-1 text-caption">
              <SampleButton onClick={() => applySample("refund")}>Refund sample</SampleButton>
              <SampleButton onClick={() => applySample("pricing")}>Pricing sample</SampleButton>
              <SampleButton onClick={() => applySample("legal")}>Legal sample</SampleButton>
            </div>
          </div>
          <Textarea
            id="rawInput"
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder="Paste a messy email, support ticket, transcribed voice note, or screenshot description here…"
            rows={10}
            className="resize-y min-h-[200px] rounded-2xl border-[rgba(var(--text)/0.1)] bg-[rgba(var(--text)/0.04)] focus-ring"
            required
          />
          <p className="text-caption text-[rgba(var(--text)/0.6)]">
            The AI will classify, extract structured facts, draft a reply, and propose actions —
            but won&apos;t take any action without your approval.
          </p>
        </div>
      </GlassCard>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Customer name (optional)" htmlFor="customerName">
          <Input
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Devon Park"
            className={FIELD_INPUT_CLASS}
          />
        </Field>
        <Field label="Customer email (optional)" htmlFor="customerEmail">
          <Input
            id="customerEmail"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="devon@northwindlabs.com"
            className={FIELD_INPUT_CLASS}
          />
        </Field>
        <Field label="Business category (optional)" htmlFor="businessCategory">
          <Input
            id="businessCategory"
            value={businessCategory}
            onChange={(e) => setBusinessCategory(e.target.value)}
            placeholder="e.g. enterprise SaaS, marketplace, healthtech"
            className={FIELD_INPUT_CLASS}
          />
        </Field>
        <Field label="Input type" htmlFor="inputType">
          <Select value={inputType} onValueChange={(v) => v && setInputType(v)}>
            <SelectTrigger id="inputType" className={FIELD_INPUT_CLASS}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TEXT">Text / paste</SelectItem>
              <SelectItem value="FORM">Form submission</SelectItem>
              <SelectItem value="FILE">File upload</SelectItem>
              <SelectItem value="SCREENSHOT">Screenshot</SelectItem>
              <SelectItem value="VOICE">Voice note (transcript)</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-2xl border border-dashed border-[rgba(var(--text)/0.14)] bg-[rgba(var(--text)/0.02)] p-4">
        <div className="flex items-center gap-3">
          <span className="inline-grid h-9 w-9 place-items-center rounded-xl bg-[rgba(var(--accent)/0.12)] text-[rgb(var(--accent))]">
            <UploadCloud className="h-4 w-4" />
          </span>
          <div>
            <p className="text-body-sm font-medium">Attach a file (optional)</p>
            <p className="text-caption text-[rgba(var(--text)/0.6)]">
              {filenameLabel ??
                "Supports PDF, DOCX, TXT/MD/CSV, and PNG/JPG screenshots (max 5 MB)."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {file ? (
            <button
              type="button"
              onClick={clearFile}
              className="focus-ring inline-flex h-9 items-center rounded-full px-3 text-caption text-[rgba(var(--text)/0.6)] hover:text-[rgb(var(--text))]"
            >
              Remove
            </button>
          ) : null}
          <label className="cursor-pointer">
            <span className="focus-ring pressable inline-flex h-9 items-center rounded-full border border-[rgba(var(--text)/0.12)] bg-[rgba(var(--text)/0.04)] px-4 text-caption font-medium hover:bg-[rgba(var(--text)/0.08)]">
              {file ? "Replace file" : "Choose file"}
            </span>
            <input
              type="file"
              className="hidden"
              accept=".txt,.md,.csv,.json,.html,.xml,.pdf,.docx,image/png,image/jpeg,image/webp,image/gif"
              onChange={onFile}
            />
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <p className="text-caption text-[rgba(var(--text)/0.55)]">
          Without an LLM key, the agent falls back to a deterministic mock so the demo still works.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "focus-ring pressable inline-flex h-11 items-center gap-1.5 rounded-full px-6 text-sm font-semibold transition-shadow",
            "bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent2))] text-white",
            "shadow-[0_8px_24px_-8px_rgba(168,162,255,0.55)] hover:shadow-[0_12px_32px_-8px_rgba(168,162,255,0.75)]",
            "disabled:cursor-not-allowed disabled:opacity-70",
          )}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Analyze request
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-caption font-medium text-[rgba(var(--text)/0.7)]">
        {label}
      </Label>
      {children}
    </div>
  );
}

function SampleButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring rounded-full border border-[rgba(var(--text)/0.1)] bg-[rgba(var(--text)/0.03)] px-2.5 py-0.5 text-[10px] font-medium text-[rgba(var(--text)/0.7)] hover:bg-[rgba(var(--text)/0.06)] hover:text-[rgb(var(--text))]"
    >
      {children}
    </button>
  );
}
