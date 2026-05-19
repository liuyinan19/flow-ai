# AI Operations Agent

A Next.js + Prisma + Anthropic Claude portfolio demo. See README.md for the full overview.

## Quick start

```bash
npm install
npm run db:reset      # creates SQLite db + seeds 5 cases
npm run dev           # http://localhost:3000
```

## Key paths

- `src/lib/ai/` — analyze pipeline, Zod schema, prompts, guardrails, mock fallback
- `src/lib/tools/` — 5 mock tools (no real side effects)
- `src/lib/pipeline.ts` — orchestrator: analyze → persist → execute tools
- `src/lib/case-state.ts` — status machine + activity log
- `src/app/api/cases/` — analyze / status / regenerate / actions / tasks endpoints
- `src/data/evaluations.ts` — 4 eval fixtures rendered on `/evaluations`

## Routes

- `/` landing · `/dashboard` · `/cases/new` · `/cases/[id]` · `/evaluations`

## Behavior notes

- Without `ANTHROPIC_API_KEY`, the heuristic mock in `lib/ai/mock-pipeline.ts` runs.
- Guardrails (`lib/ai/guardrails.ts`) override `needsHumanReview` to true on confidence < 0.75, HIGH risk flags, LEGAL requests, refund/lawsuit/GDPR keywords, or 3+ missing-info items.
- Tools with `requiresApproval: true` stay PENDING until a human approves them.
