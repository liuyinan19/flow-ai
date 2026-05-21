# AI Operations Agent

> An AI workflow automation system that transforms messy business input into structured cases, tasks, draft responses, and operational decisions — with humans in the loop on every risky case.

This project demonstrates full-stack AI delivery: scoping a messy business workflow, designing an AI pipeline, implementing structured extraction, tool orchestration, human review, dashboarding, and production-minded evaluation. It is built around how Forward Deployed Engineering teams actually ship AI in production — explainable, safe, and human-supervised.

## The problem

Real business operations teams drown in messy, unstructured inbound: emails, support tickets, voice notes, screenshots, forms. Each one needs to be triaged, classified, extracted into structured fields, assigned, replied to, and tracked. Most of this is the same job — repeated thousands of times — but every "naive AI auto-reply" demo glosses over the actual hard parts:

- What if the model misclassifies a legal complaint as support?
- What if it hallucinates a refund?
- What if confidence is low and we shouldn't auto-respond?
- How does a human edit, override, or regenerate the AI's output?
- Where do operational actions live, and when does a human have to approve them?

This project takes those questions seriously.

## The solution

The agent runs a deterministic pipeline on each new case:

1. **Ingest** raw input from multiple channels:
   - Pasted text (email body, support ticket, transcribed voice note)
   - Uploaded text files (`.txt`, `.md`, `.csv`, `.json`, `.html`)
   - Uploaded PDFs (parsed server-side with `pdf-parse` v2)
   - Uploaded DOCX (parsed with `mammoth`)
   - Uploaded screenshots / images (PNG, JPEG, WebP, GIF — sent to Claude as multimodal vision content blocks)
2. **Classify & extract** via an Anthropic Claude tool call returning JSON-schema-validated output (Zod-checked). When the user attaches an image, the call becomes multimodal — the model reads the screenshot and the prompt together.
3. **Apply guardrails** — confidence floor (0.75), keyword triggers (refund / lawsuit / GDPR / compliance / chargeback / cancel-my-account), HIGH risk flags, LEGAL request type, and missing-information thresholds all force `needsHumanReview: true`.
4. **Recommend actions** from a fixed toolbox (`routeCase`, `createInternalTask`, `draftCustomerEmail`, `createCalendarFollowUp`, `sendToHumanReview`).
5. **Execute** non-sensitive actions and **hold** anything `requiresApproval: true` as `PENDING` for a human click.
6. **Persist** an analysis, tasks, mock integration actions, and an activity-log entry for every step.
7. **Move** the case through a status machine (`NEW → ANALYZED → IN_PROGRESS → COMPLETED`, with a `NEEDS_REVIEW` exception path), logging every transition.
8. **Surface** the whole thing on a polished dashboard with metrics, filters, drill-down, editing, and a streamed demo flow.
9. **Run live evaluations** at `/evaluations` — fire every fixture through the live pipeline, assert request type / review flag / tool set, and report pass / fail with per-fixture latency.

If no `ANTHROPIC_API_KEY` is configured, the pipeline falls back to a deterministic heuristic mock so the full demo still works end-to-end. Every API response includes a `source: "anthropic" | "mock" | "fallback"` field so the UI surfaces which pipeline ran.

## Tech stack

- **Next.js 16** (App Router, Server Components, Server Actions)
- **TypeScript** end-to-end
- **Tailwind CSS v4** + **shadcn/ui** (base-nova preset, base-ui primitives)
- **Prisma 6** + **SQLite** (zero-install local dev; swap to Postgres for prod in one line)
- **Anthropic Claude** tool use for structured output, **Zod** for validation
- **Mock integrations** for email/calendar/tasks — every "action" writes a `MockIntegrationAction` row, nothing ever leaves the system

## Architecture

```
                    ┌──────────────────────┐
                    │  /cases/new   /api/  │
                    │  /api/demo    cases  │
                    └──────────┬───────────┘
                               ▼
                    ┌──────────────────────┐
                    │   src/lib/pipeline   │
                    │  createAndAnalyze()  │
                    └──────────┬───────────┘
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        ┌──────────┐    ┌────────────┐   ┌────────────┐
        │  ai/     │    │ guardrails │   │  tools/    │
        │ analyze  │ →  │  override  │ → │  execute   │
        │ Claude + │    │ confidence │   │  & log     │
        │ Zod tool │    │ keywords   │   │ mock action│
        │ call     │    │ risk flags │   │ rows       │
        └──────────┘    └────────────┘   └────────────┘
              │                                │
              └──────────────┬─────────────────┘
                             ▼
                    ┌──────────────────────┐
                    │  Prisma → Case +     │
                    │  Analysis + Tasks +  │
                    │  Actions + Activity  │
                    └──────────────────────┘
```

### Key files

| File | Purpose |
|---|---|
| `prisma/schema.prisma` | Source of truth for the data model |
| `prisma/seed.ts` | 5 hand-authored realistic cases |
| `src/lib/db.ts` | Prisma singleton with hot-reload guard |
| `src/lib/ai/schema.ts` | Zod schema = the AI's contract + JSON schema for tool use |
| `src/lib/ai/prompt.ts` | System & user prompt builders |
| `src/lib/ai/analyze.ts` | Anthropic tool call → Zod validate → safe fallback |
| `src/lib/ai/guardrails.ts` | Post-LLM safety overrides |
| `src/lib/ai/mock-pipeline.ts` | Deterministic heuristic when no key is set |
| `src/lib/tools/index.ts` | 5 mock tools writing `MockIntegrationAction` rows |
| `src/lib/case-state.ts` | Status machine + activity log writer |
| `src/lib/pipeline.ts` | Orchestrates analyze → guardrails → persist → tools |
| `src/data/evaluations.ts` | 4 hand-authored eval fixtures (good / bad / mismatch / hallucination) |

## AI pipeline design

### Structured output via forced tool use

The model has access to exactly one tool, `submit_case_analysis`, whose `input_schema` mirrors the Zod schema. `tool_choice` is set to `{ type: "tool", name: "submit_case_analysis" }`, so the model **must** return structured output — it can't free-text its way around the contract.

```ts
const response = await client.messages.create({
  model: "claude-sonnet-4-5",
  system: SYSTEM_PROMPT,
  tools: [{ name: "submit_case_analysis", input_schema: caseAnalysisJsonSchema }],
  tool_choice: { type: "tool", name: "submit_case_analysis" },
  messages: [{ role: "user", content: buildUserPrompt(input) }],
});
```

The `tool_use` block is parsed and Zod-validated. If validation fails, the pipeline degrades gracefully:

1. The mock heuristic runs against the input.
2. Confidence is capped at 0.6.
3. `needsHumanReview` is forced to `true`.
4. The internal notes explain why this is from the fallback path.
5. An activity log entry records the failure mode.

### Guardrails (post-LLM overrides)

`needsHumanReview` is set to `true` if **any** of these are true, regardless of what the model said:

- `confidence < 0.75`
- Any risk flag has `severity: "HIGH"`
- `requestType === "LEGAL"`
- The raw input contains trigger keywords (`refund`, `chargeback`, `lawsuit`, `lawyer`, `gdpr`, `hipaa`, `compliance`, `data breach`, …)
- `extractedData.missingInformation.length >= 3`

The system prompt also explicitly forbids the model from:

- Promising refunds, legal outcomes, or compensation
- Claiming actions have been taken (everything is just a recommendation)
- Inventing facts not present in the input

### Tool calling design

Five tools, each backed by a function in `src/lib/tools/index.ts`. They never call real external services — they write a `MockIntegrationAction` row with the payload that *would* be sent, plus a clear status:

- `COMPLETED` — the mock action ran (e.g. `routeCase` updated `assignedTeam`)
- `PENDING` — `requiresApproval` was true, waiting for a human click
- `FAILED` — human rejected the pending action

The UI surfaces all of this in a dedicated **Actions** tab on the case detail page, with the tool name, reason, payload, and approve/reject buttons for pending ones.

## Human-in-the-loop

Every output the model produces is editable:

- **Request type / Priority / Assigned team** — inline editor on the case detail page
- **Draft customer response** — full textarea with save + regenerate
- **Task checklist** — click status icons to advance TODO → IN_PROGRESS → DONE
- **Pending tool actions** — approve or reject each one
- **Full analysis** — one button re-runs the entire pipeline

Every human edit is logged as a `human_edit` event in the activity log, so you always have an audit trail of "what was AI vs what was changed."

## Database schema

Six tables: `Case`, `CaseAnalysis`, `Task`, `ActivityLog`, `MockIntegrationAction` — plus the standard `_prisma_migrations`. JSON-bearing fields are stored as `String` and parsed with a typed `parseJson<T>` helper, so the same schema runs on SQLite (dev) or Postgres (prod — change `provider` in `schema.prisma`, set `DATABASE_URL`, done).

See `prisma/schema.prisma` for the full schema. Indexes are added on the columns the dashboard actually filters / orders by (`status`, `priority`, `requestType`, `createdAt`, `caseId+createdAt` on activity log).

## Risk controls (summary)

1. **Forced tool use** — model cannot return free-text classifications.
2. **Zod-validated output** with a safe fallback path on parse failure.
3. **Confidence floor** at 0.75.
4. **Keyword + request-type triggers** force human review.
5. **No real actions** — every tool writes a mock row.
6. **`requiresApproval` flag** — sensitive tools stay PENDING.
7. **Activity log on every transition, edit, regenerate, and tool call.**
8. **Per-IP rate limit** on LLM-spending endpoints — 8/min on `/api/cases/analyze`, 4/min on `/api/demo` and `/api/evaluations/run`. Token-bucket, in-memory per instance; documented in `src/lib/rate-limit.ts` as a portfolio-scale placeholder for Upstash / Vercel KV.
9. **File ingest hardening** — 5 MB cap, MIME allowlist, structured `FileIngestError` codes (`too_large`, `unsupported_type`, `parse_failed`, `empty`) surfaced to the client.
10. **Route-level `error.tsx` boundary** so a thrown error renders a recover-able UI instead of blanking the page.

## Evaluation examples

The `/evaluations` route renders four hand-authored fixtures that capture the failure modes I care about most:

1. **Good answer** — refund request correctly held for human review with a calm, non-committal draft.
2. **Bad answer** — AI under-classifies a legal complaint, but the keyword/confidence guardrails catch it before any auto-action.
3. **Source mismatch** — AI invents a deadline not in the input; documents how a substring-grounding check would prevent it.
4. **Hallucination risk** — AI promises a refund in an earlier draft; current prompt + `requiresApproval` catch it.

Each fixture shows the input, the AI output, the expected output, the failure mode, and the guardrail that prevents it. This is the page recruiters / hiring managers should open.

## Setup

```bash
# 1. Install
npm install

# 2. Generate Prisma client + create SQLite db + seed 5 cases
npm run db:reset

# 3. (Optional) Add your LLM key
cp .env.example .env
# Edit .env and set ANTHROPIC_API_KEY=sk-ant-…
# Without a key, a deterministic heuristic mock runs instead.

# 4. Run
npm run dev
# → http://localhost:3000
```

### Environment variables

| Var | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | SQLite file by default (`file:./dev.db`). Change to a Postgres URL for prod. |
| `ANTHROPIC_API_KEY` | no | If set, the real Claude pipeline runs (vision-capable). If not, the heuristic mock runs. |
| `OPENAI_API_KEY` | no | Reserved for a future OpenAI fallback path. |

### Scripts

- `npm run dev` — start Next.js dev server
- `npm run build` — production build + type check
- `npm run lint` — ESLint
- `npm run db:push` — push the Prisma schema to the database
- `npm run db:seed` — seed 5 realistic cases
- `npm run db:reset` — nuke `prisma/dev.db` and re-seed from scratch

## Demo script (for a 90-second walkthrough)

1. Open `/dashboard` — five pre-seeded cases, mix of statuses, including a HIGH-risk refund and a GDPR escalation.
2. Click **Run demo case** — watch the streamed pipeline progress (reading → classifying → extracting → drafting → flagging) and land on a populated case detail page.
3. Open the refund case from the dashboard — note the rose banner, HIGH risk flags, the draft response that **does not** promise a refund, and a `draftCustomerEmail` action sitting `PENDING` for human approval.
4. Open `/evaluations` — show the four eval cards with pass/fail and the guardrails that catch each failure mode.
5. Back on a case detail page, change the priority dropdown — see the activity log gain a `human_edit` entry instantly.

## Why this project matters for AI Forward Deployed roles

Forward Deployed Engineering at OpenAI / Anthropic / Glean / Sierra / Palantir is about turning a customer's messy real-world workflow into a reliable AI-powered system. Doing that well requires:

- **Workflow scoping** — choosing the right unit of work (a *case*) and the right action surface (a fixed toolbox).
- **Pipeline design** — forced structured output, validation, fallback paths, guardrails.
- **Tool orchestration** — knowing which actions are safe to auto-run vs. which need a human click.
- **Human-in-the-loop UX** — making review, edit, and regenerate first-class, not afterthoughts.
- **Evaluation thinking** — picking the failure modes that matter and showing how they're prevented.
- **Production polish** — empty states, loading states, error handling, audit trails, no broken routes.

This project demonstrates all of those on a small but realistic workflow.

## Future improvements

- Replace SQLite with Postgres + Drizzle (or keep Prisma), and run on Neon.
- Add a real source-grounding check — every `keyFact` must appear (substring or fuzzy) in the input.
- Stream the Claude response token-by-token so the streamed demo runner reflects real progress.
- Add multi-tenant workspaces with auth (Clerk / Auth.js).
- Add a *real* evaluation harness that re-runs all 4 fixtures against the live model on every push and reports a pass-rate.
- Add CSV / Slack / Linear export for downstream task systems.
- Add a "what changed?" diff between human-edited and AI-generated versions.

## License

MIT — this is a portfolio demo, take what's useful.
