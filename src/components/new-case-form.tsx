"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent } from "@/components/ui/card";

const SAMPLES: Record<string, string> = {
  refund:
    "I've been a customer for 14 months and your latest update broke our integration. We pay $12,000/year and lost two days of revenue. Refund our annual fee or we're switching to your competitor on Monday. -Devon, CTO @ Northwind",
  pricing:
    "Hi! I run platform engineering at Globex (around 800 engineers). Could you share enterprise pricing, SSO/SAML availability, SOC2 status, and a realistic implementation timeline? Ideally live by end of Q1.",
  legal:
    "I am exercising my right to erasure under GDPR Article 17. Please delete all personal data my company has stored, including backups, within 30 days. If not done, I will escalate to our DPO and the regulator. -Ana, Meadowlark GmbH",
};

export function NewCaseForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [rawInput, setRawInput] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [inputType, setInputType] = useState("TEXT");
  const [filename, setFilename] = useState<string | null>(null);

  const applySample = (key: keyof typeof SAMPLES) => {
    setRawInput(SAMPLES[key]);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFilename(`${f.name} (${Math.round(f.size / 1024)} KB)`);
    setInputType("FILE");
    toast.info(
      "File metadata captured. (Demo: file contents aren't parsed — paste the text below.)",
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rawInput.trim().length < 10) {
      toast.error("Paste at least a sentence so the AI has something to work with.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/cases/analyze", {
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
      const json = await res.json();
      if (!res.ok || !json.caseId) {
        throw new Error(json.error ?? "Analysis failed.");
      }
      toast.success("Case analyzed.");
      router.push(`/cases/${json.caseId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="rawInput" className="text-sm font-medium">
                Paste the customer&apos;s message
              </Label>
              <div className="flex gap-1 text-xs">
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                  onClick={() => applySample("refund")}
                >
                  Refund sample
                </button>
                <span className="text-muted-foreground">·</span>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                  onClick={() => applySample("pricing")}
                >
                  Pricing sample
                </button>
                <span className="text-muted-foreground">·</span>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                  onClick={() => applySample("legal")}
                >
                  Legal sample
                </button>
              </div>
            </div>
            <Textarea
              id="rawInput"
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Paste a messy email, support ticket, transcribed voice note, or screenshot description here…"
              rows={10}
              className="resize-y min-h-[180px]"
              required
            />
            <p className="text-xs text-muted-foreground">
              The AI will classify, extract structured facts, draft a reply, and propose actions —
              but won&apos;t take any action without your approval.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customerName">Customer name (optional)</Label>
          <Input
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Devon Park"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerEmail">Customer email (optional)</Label>
          <Input
            id="customerEmail"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="devon@northwindlabs.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessCategory">
            Business category hint (optional)
          </Label>
          <Input
            id="businessCategory"
            value={businessCategory}
            onChange={(e) => setBusinessCategory(e.target.value)}
            placeholder="e.g. enterprise SaaS, marketplace, healthtech"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inputType">Input type</Label>
          <Select value={inputType} onValueChange={(v) => v && setInputType(v)}>
            <SelectTrigger id="inputType">
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
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <UploadCloud className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Attach a file (optional)</p>
              <p className="text-xs text-muted-foreground">
                {filename ?? "Demo only — we record the filename but don't parse contents."}
              </p>
            </div>
          </div>
          <label className="cursor-pointer">
            <span className="inline-flex h-8 items-center rounded-md border border-border bg-background px-3 text-xs font-medium hover:bg-accent">
              Choose file
            </span>
            <input type="file" className="hidden" onChange={onFile} />
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {process.env.NEXT_PUBLIC_AI_NOTE ??
            "If no LLM key is set, a deterministic mock pipeline runs instead."}
        </p>
        <Button type="submit" disabled={submitting} size="lg">
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Analyze request
        </Button>
      </div>
    </form>
  );
}
