# ChaseUp — Full Product Plan

**Working name:** ChaseUp (to be confirmed against domain/trademark before launch)
**Product:** Overdue-invoice chasing for B2B service firms on QuickBooks Online and Xero
**Price:** $99/month flat, unlimited users
**Targets:** ~$2,000 MRR within 3 months → ~$5,000 MRR within 12 months → sellable on Acquire.com
**Architect:** Muse. This document is the source of truth for the build. Decisions in it stand unless Mahaz overrides them.

---

## 1. The problem

B2B service firms — agencies, consultancies, IT services, accountants, lawyers, trades — get paid late. Research for this product found firms with outstanding invoices owed over $17,000 on average, and roughly half of B2B invoices going overdue. Founders and ops people chase this money by hand: spreadsheets, memory, awkward emails they keep putting off. The money is real, the chasing is miserable, and it doesn't get done consistently.

ChaseUp does the chasing for them, automatically, without hiring anyone.

## 2. Who pays

**Ideal customer:** a B2B service firm, 2–50 people, $100k–$5M annual revenue, running QuickBooks Online or Xero, sending at least ~10 invoices a month, with real overdue pain (invoices sitting 30+ days past due).

**Who it is NOT for:** consumer subscription businesses, freelancers with 2 invoices a month, enterprises with a finance team (they buy Upflow/Chaser), firms not on QBO or Xero.

**Why they pay $99:** one recovered invoice typically covers months of the subscription. The pitch is not "software" — it is "money you are currently leaving on the table, collected for you."

## 3. What the product does (MVP scope)

### Core loop
1. Connect QBO or Xero via OAuth. Sync customers, invoices, payments.
2. Detect overdue invoices automatically (days past due, amount outstanding).
3. Run escalating reminder sequences by email: friendly → firm → final. Customizable templates, send windows, auto-pause the moment payment lands.
4. Rank a daily **"who to call today"** queue: broken promises first, then highest amount × days overdue. One-click call notes.
5. **Promise-to-pay:** record a promised date and amount. If it breaks, flag it and auto-resume the sequence.
6. **Disputes:** mark an invoice disputed → reminders pause, reason is tracked, nothing embarrassing gets sent mid-dispute.
7. Dashboard: total overdue, amount collected via ChaseUp, aging buckets, top debtors, activity log per invoice and customer.

### Deliberately NOT in v1
- No SMS, no phone dialer (email only at launch).
- No AI-written emails (templates only — predictable, safe, no hallucinations to a customer's customer).
- No write-backs into QBO/Xero (read-only sync — lower risk, faster approval on both app stores).
- No multi-client accountant portal (phase 2 wedge — accountants referring clients).
- No white-label, no consumer dunning, no FX conversion (amounts shown in invoice currency).

### Definition of done for v1
A new user can connect QBO in under 5 minutes, get their first sequence live the same day, have the first reminder sent automatically, see a payment auto-pause a sequence, see "collected via ChaseUp" on their dashboard, pay via Stripe — all without founder help.

## 4. Architecture

Opinionated stack, chosen for a solo builder: boring technology, low cost, easy to hand to a buyer.

| Layer | Choice |
|---|---|
| App | Next.js (App Router) + TypeScript, single codebase |
| Database | PostgreSQL via Neon, Drizzle ORM |
| Auth | Auth.js (email + Google sign-in) |
| Billing | Paddle subscriptions (merchant of record) — see §5 note |
| Email | Resend, dedicated sending domain, SPF/DKIM/DMARC |
| Background jobs | Inngest (reminder sequences, sync jobs, reconciliation) |
| Hosting | Vercel |
| Accounting APIs | QBO + Xero OAuth2, REST, webhooks + nightly reconciliation |
| Observability | Sentry (errors), PostHog (funnels) |

### Data model (core tables)
Organization, User, Membership, AccountingConnection (OAuth tokens encrypted at rest, AES-256-GCM), Customer, Invoice, Payment, Sequence, SequenceStep, Reminder (send log), Promise, Dispute, Activity, CallTask.

### Sync design
- OAuth2 connect, automatic token refresh.
- Webhooks where available (QBO, Xero) for near-real-time invoice/payment events.
- Nightly reconciliation job so a missed webhook never leaves data stale.
- Idempotent invoice upserts. Never delete on a sync mismatch — mark stale and surface it.

### Reminder engine (state machine per invoice)
current → due_soon → overdue → seq_1 → seq_2 → seq_final → escalated.
Transitions: payment received → paid (stop everything); promise recorded → promised (pause until date); promise broken → resume at next step; dispute opened → disputed (pause); dispute resolved → resume.

### "Who to call today" ranking
Explainable, no black box: broken promises first, then amount outstanding × days overdue. A user must be able to see why an invoice is at the top.

### Security and tenancy
- Single database, `org_id` on every query — no cross-org leakage, ever.
- OAuth tokens encrypted at rest. No bank details stored. No QBO/Xero write access.
- Stripe webhook signature verification. Daily database backups.
- Audit log on all reminder sends and status changes (a buyer will ask for this).

## 5. Pricing

- **$99/month flat, unlimited users.** No seat pricing — this is itself a selling point against per-seat tools.
- 14-day free trial, no card upfront (recommended: lower friction, higher trial starts; test card-upfront later if trial-to-paid is weak).
- Monthly billing only at launch. Annual option ($990/year, two months free) added in month 3–4 once retention is proven.
- No discounts at launch except a founding-customer price lock (early users keep $99 forever) — used as a pre-sale incentive during build, not a price cut.

**Billing route (corrected 2026-10-28):** Stripe does NOT onboard Pakistan-based businesses directly, so the plan uses **Paddle** instead. Paddle is a merchant of record: it is the legal seller, handles VAT/sales tax globally, and pays out to Pakistan (wire or Payoneer, $100 minimum payout). No monthly fee, no setup cost — it takes 5% + $0.50 per sale out of revenue, so it costs nothing before the first paying client. Lemon Squeezy is the backup option (same 5% + $0.50 headline, but adds international surcharges and is migrating toward Stripe's managed-payments system — check before building on it). A US LLC + Stripe is a later option at scale, not needed now (formation alone is ~$249 plus annual compliance).

## 6. Competitive position (live-checked 2026-10-28)

| Competitor | Price | What it means for ChaseUp |
|---|---|---|
| Chaser | £199/mo floor (Core £599, Complete £899, GBP excl. VAT) | ChaseUp is half the floor price, with a simpler scope. |
| Paidnice | Essentials $69/mo, Pro $99/mo | **Price parity at Pro.** Price alone is NOT the wedge here. |
| Upflow | No published price (quote-only) | Enterprise motion; not competing for the same buyer. |

**The wedge, stated honestly:** against Chaser it is price and simplicity; against Paidnice it is workflow, not price — the dispute + promise-to-pay queue (who to call today, broken-promise flags, dispute pausing reminders) and a vertical focus on service firms. If the product is just "reminders," Paidnice wins on brand. The queue and the promise/dispute handling are the moat.

**Dropped figures (do not quote):** the "$259/mo" Chaser US figure was not on Chaser's own pricing page; the "$440/mo" Upflow figure is a 2024 third-party capture, not a current price. Re-check all competitor prices on the day launch pricing is fixed.

## 7. Revenue math

| Milestone | Customers | MRR |
|---|---|---|
| Month 3 | 20 | 20 × $99 = $1,980 |
| Month 6 | ~32 | ~$3,168 |
| Month 9 | ~44 | ~$4,356 |
| Month 12 | 55 | 55 × $99 = $5,445 |

Assumptions, stated plainly: churn under 5%/month. At 5% monthly churn on 55 customers, ~3 customers leave per month, so months 4–12 need ~7 gross adds per month to net +35. If churn runs higher, the $5,000 target slips — churn is the single biggest risk to the plan, ahead of competition.

## 8. Build sequence

| Phase | Weeks | What ships |
|---|---|---|
| 0 — Validation | 1 | Landing page + waitlist + 10 conversations with service-firm owners. Goal: confirm the overdue pain in their words and collect founding-customer commitments. Runs in parallel with Phase 1 setup, not as a gate that stalls building. |
| 1 — Core | 2–5 | Auth, Paddle billing, QBO connect + sync, dashboard (overdue, aging, collected). |
| 2 — Chasing | 6–8 | Sequences + templates, call queue, promises, disputes, activity log. Xero connect added here. |
| 3 — Hardening | 9–10 | Onboarding flow, email deliverability (domain warmup, SPF/DKIM), docs, error handling, backups. |
| Launch | 11–12 | Beta users convert to paid. Target: 20 paying by end of month 3. |

**Honest timeline note:** the build takes ~10 weeks, so the $2,000 milestone lands at the end of month 3 only if pre-selling during build works (waitlist → founding customers at the $99 price lock). If build slips, the milestone slips with it. The lever is pre-sales, not cutting the chasing engine — a half-built chaser collects nothing and churns everyone.

## 9. Go-to-market (how 20 becomes 55)

Ranked by intent, not by fashion:

1. **QBO App Store + Xero App Store listings.** Highest-intent channel: firms already looking for help inside their accounting tool. Listing quality (screenshots, reviews) is a real task, not an afterthought.
2. **Free overdue snapshot (lead magnet).** Connect QBO/Xero, get a one-time overdue aging report free. It demonstrates the pain with their own numbers, then converts to the chasing tool.
3. **Communities.** r/smallbusiness, r/QuickBooks, r/Xero, Indie Hackers — genuine help on chasing threads, not spam. The founder's own overdue-invoice story is the content.
4. **Content/SEO.** Chasing guides, "how to chase late payment" playbooks, honest comparison pages (including the Chaser/Paidnice prices above).
5. **Accountant referrals (phase 2).** Accountants see the overdue pain across clients; a multi-client view turns them into a channel.

**Not doing:** cold email outreach. For an email-sending product, a spam complaint trail is a reputation risk that can kill deliverability.

**Churn defense (from day one):** onboarding that gets the first sequence live in the first session; a monthly "collected for you" report email that shows the value in dollars; annual billing offered once retention is proven.

## 10. Costs (at 55 customers)

| Item | ~Monthly |
|---|---|
| Vercel + Neon + Resend + Inngest + Sentry + PostHog | ~$60 (mostly free tiers at start, scaling with use) |
| Domain | ~$1 |
| Paddle fees (5% + $0.50 per $99 payment) | ~$300 |
| **Total** | **~$361 on $5,445 revenue → ~93% gross margin before founder time** |

This margin profile matters for the exit: Acquire.com buyers expect SaaS gross margin above 75%.

## 11. Exit readiness (built in from day one, not bolted on later)

- Separate business Paddle account, own domain, no personal accounts anywhere in the stack.
- Clean repo with README + ARCHITECTURE.md (this plan is the seed of it).
- Monthly metrics tracked from the first paying customer: MRR, churn, net revenue retention.
- A runbook: can the product run 90 days without the founder? (Buyers ask this. Self-serve onboarding + automated sequences + documented ops is the answer.)
- No founder-dependent manual processes. No single customer over ~10% of revenue.

**Acquire.com reality check (from the 2026-10-28 research):** $5,000 MRR is roughly the floor of buyer attention — below it, listings get buried. Illustrative value at $5,000 MRR is ~$150,000–$240,000 at 2.5–4x annual revenue, or ~$166,000 at the 3.9x profit median on ~71% margin. Profit multiples and revenue multiples are quoted interchangeably by different sources — do not mix them when valuing the business. Growth above 30% year-on-year and net revenue retention above 110% push multiples up; churn above 3–4% a month and founder dependency push them down.

## 12. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Paidnice parity — price is not the wedge | Win on the promise/dispute workflow and service-firm focus; say so explicitly in marketing. |
| Churn above 5%/mo breaks the $5k math | Onboarding + monthly value reports + annual lock-in; watch churn weekly from customer #1. |
| QBO/Xero API or policy changes | Webhook + nightly reconciliation fallback; read-only scope keeps app-store approval simple. |
| Email deliverability (spam folders kill a chasing tool) | Dedicated domain, warmup, SPF/DKIM/DMARC, reply-to handling, complaint monitoring. |
| Founder dependency at exit | Documentation, automation, self-serve everything, runbook from day one. |
| Build slips past 10 weeks | Pre-sell during build; cut scope in this order: Xero (delay), templates (fewer), analytics (later) — never cut the chasing engine. |

## 13. Decisions already made (override only by Mahaz)

- **Name:** ChaseUp (working name; confirm domain/trademark before launch).
- **First integration:** QuickBooks Online (largest US market, biggest app-store audience). Xero follows in Phase 2.
- **Trial:** 14 days, no card upfront.
- **Launch geography:** global English-speaking (US, UK, AU, CA).
- **Price:** $99/mo flat, unlimited users, monthly billing at launch.

## 14. Next step

Build Phase 0 + 1: landing page + waitlist, repo scaffold, auth, Paddle billing, QBO connect + sync, dashboard. Mahaz's only jobs: approve this plan (or override a decision above) and confirm the name when the domain check is done.

## 15. Build status (2026-10-28)

- Foundation shipped and verified: landing + waitlist, auth, schema + migration.
- Dashboard shell shipped and verified: session/org helpers, onboarding, protected dashboard with members list and honest empty states.
- Paddle billing shipped and verified 2026-10-28: subscriptions table + migration, Paddle client (sandbox/production, activates on keys), hosted-checkout subscribe flow, customer portal, signature-verified webhook route (subscription lifecycle events upserted by Paddle subscription id), billing page with plan + status + period end. Billing page shows an honest "setup in progress" state until Paddle keys exist; no paywall enforcement yet — gating lands with the chasing engine, when there is value to gate.
- QuickBooks connect + sync shipped and verified 2026-10-28: OAuth2 connect (signed state bound to the org, callback verifies state + signed-in org match before exchanging the code), tokens stored AES-256-GCM encrypted (key derived from AUTH_SECRET), automatic refresh on expiry plus one retry on 401, paged sync of customers + invoices (upserted by QuickBooks id, last-synced stamp on the connection), dashboard now shows real overdue totals (count + sum, grouped by currency, or a clean "none right now" state) and a connection card with sync/disconnect. Read-only by design: accounting scope only, no write-backs. Live OAuth + sync testing awaits the Intuit developer app (Mahaz's later step); everything else typechecked, built, and smoke-tested (bad callback state rejected before any Intuit call).
- Chasing engine shipped and verified 2026-10-28: call queue page (/dashboard/queue) ordered broken promises first, then amount × days overdue; 4-step escalating reminder sequence (day 1 friendly, 7 firm, 14 final notice, 30 escalation) rendered per invoice with the next reminder shown and logged when sent — reminders are NOT auto-emailed yet (that needs Resend + a verified domain, a later step); promise-to-pay recording (one open promise per invoice, broken derived live from promised date + unpaid balance, kept marked automatically at sync when the invoice is paid); dispute pausing (open dispute removes the invoice from the queue until resolved); activity log of calls, promises, disputes, and reminders on the queue page. All actions validate org ownership and log out-of-order steps as errors.
- Subscription gating shipped and verified 2026-10-28: 14-day trial per org (from org creation, no card), then paywall. Access rule: active, trialing, or past-due Paddle subscription grants access (past-due keeps access during Paddle's dunning retries; cancellation ends it), otherwise trial clock decides. Enforced in the dashboard and queue pages AND in every value action (QBO connect/sync, all chase actions) — paywalled requests redirect to /dashboard/billing, which stays open and shows a trial-ended banner plus a trial countdown while trialing. Billing actions and disconnect stay ungated by design (exit paths must never be locked).
- PHASE 2 (Xero) + PHASE 1 IMPROVEMENTS shipped and verified 2026-10-28: Xero connect + sync (OAuth2 with signed state, tenant resolution via /connections using the first tenant, encrypted tokens with refresh + 401 retry, paged contacts + ACCREC invoices excluding VOIDED/DELETED, Xero's /Date(ms)/ format parsed). To support two providers cleanly, invoices and customers were unified into shared tables with a source column (quickbooks/xero) — provider connection tables stay separate, and the queue, promises, disputes, and dashboard now work identically for both providers; disconnecting one provider deletes only its own data. Phase 1 improvements in the same push: an invoices list page with search and Paid/Overdue/Open badges, sync-freshness notes on the queue page, a trial countdown on the dashboard, a daily sync cron (vercel.json → /api/cron/sync-all, bearer CRON_SECRET, active once deployed), and Vitest unit tests (16 passing) for the reminder sequence, dates, billing access, and money formatting. Migration note: drizzle-kit 0004 needed one hand-correction — it emitted redundant DROP CONSTRAINT lines after DROP TABLE CASCADE, which would fail on apply; those lines were removed (end state identical, snapshot unaffected). Live Xero OAuth testing awaits a Xero developer app (Mahaz's later step, alongside Neon, Paddle, Intuit).
- UI REDESIGN shipped and verified 2026-10-28: full design system (Inter + Instrument Serif italic accents, emerald/slate palette, float + fade-up animations) and a professional landing page (dark hero with a CSS dashboard mock, how-it-works, 6-feature grid, pricing, FAQ accordion, dark final CTA), a branded /signin page (Google sign-in, honest setup-notice when keys are absent, Auth.js pages config + requireUser now redirect to /signin), and a dashboard shell (desktop sidebar + mobile nav with active states, org + sign-out). Dashboard home gained a stats row (overdue count, total overdue, synced, plan); queue gained All/Broken-promises filters, avatar initials, and severity edge colors; invoices/billing/onboarding restyled with shared Pill component. Landing conversion changed from waitlist to trial signup now that auth is live; the waitlist form/action remain in code for reuse.
- SIGN-IN REDESIGN 2026-10-28 (ninth push, GitHub commit 94e40f0f40bdde29c1decfbfa89ec9cb588342db, 84 files; sync record now 9 entries): split-screen sign-in — form column on the left, dark showcase panel on the right with headline, value bullets, and the dashboard mock. The setup notice now names the fix (add GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET to .env.local, restart dev server) instead of "check back soon". Note from Mahaz's local run: AUTH_SECRET="mahaz" is fine for local dev and was NOT the cause of the notice — the notice means Google OAuth keys are missing. Google Stitch check: it is a Google Labs tool needing his Google sign-in (possibly waitlist); no connector exists to drive it from here, so the redesign was done in that modern style directly. If he generates a Stitch design he likes, it can be implemented from the export.
- Next: reminder auto-send via Resend once a domain exists; then pre-selling (waitlist → founding customers) while Mahaz's setup accounts land.
