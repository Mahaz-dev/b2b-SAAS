# ChaseUp

Overdue-invoice chasing for B2B service firms on QuickBooks Online and Xero.

Sync invoices, work a daily call queue ordered by broken promises first, then amount × days overdue, send escalating reminders, record promises to pay, and pause disputed invoices. $99 a month flat, with a 14-day trial and no card upfront.

## Setup

1. Copy `.env.example` to `.env` and fill in the values.
2. `npm install`
3. `npm run db:generate`
4. `npm run db:migrate`
5. `npm run dev`

## Environment

- `DATABASE_URL` — Postgres connection string (Neon in production)
- `AUTH_SECRET` — random secret for Auth.js sessions and token encryption
- `AUTH_URL` — app origin, used to derive OAuth redirect URIs
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — Google sign-in
- `PADDLE_API_KEY`, `PADDLE_PRICE_ID`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_ENVIRONMENT` — billing (sandbox until launch)
- `QBO_CLIENT_ID`, `QBO_CLIENT_SECRET`, `QBO_ENVIRONMENT`, `QBO_REDIRECT_URI` — QuickBooks (redirect URI defaults to `{AUTH_URL}/api/quickbooks/callback`)
- `XERO_CLIENT_ID`, `XERO_CLIENT_SECRET`, `XERO_REDIRECT_URI` — Xero (redirect URI defaults to `{AUTH_URL}/api/xero/callback`)
- `CRON_SECRET` — bearer token for the daily sync cron; Vercel sends it automatically when set

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run typecheck` — TypeScript check
- `npm test` — unit tests for the pure chasing, billing, and formatting logic
- `npm run db:generate` — generate a migration from the schema
- `npm run db:migrate` — apply migrations to the database

## How it is built

- Landing page with waitlist, Google sign-in, organization onboarding
- Protected dashboard, call queue, invoices list, and billing pages
- QuickBooks and Xero OAuth, encrypted tokens, automatic refresh, paged sync
- Paddle hosted checkout, customer portal, and signature-verified webhooks
- 14-day trial gating on every page and value action; billing and disconnect stay open
- Daily sync cron (`vercel.json` → `/api/cron/sync-all`) once deployed

## Docs

- `PLAN.md` — full product plan
- `CONVENTIONS.md` — code standards every change must meet
