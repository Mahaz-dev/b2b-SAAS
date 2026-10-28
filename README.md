# ChaseUp

Overdue-invoice chasing for B2B service firms on QuickBooks Online and Xero.

## Setup

1. Copy `.env.example` to `.env` and fill in the values.
2. `npm install`
3. `npm run db:generate`
4. `npm run db:migrate`
5. `npm run dev`

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run typecheck` — TypeScript check
- `npm run db:generate` — generate a migration from the schema
- `npm run db:migrate` — apply migrations to the database

## Docs

- `PLAN.md` — full product plan
- `CONVENTIONS.md` — code standards every change must meet
