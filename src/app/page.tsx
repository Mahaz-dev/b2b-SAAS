import Link from "next/link";
import { LandingDashboardMock } from "@/components/landing-dashboard-mock";
import { Logo } from "@/components/logo";

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-panel text-brand">
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        {children}
      </svg>
    </span>
  );
}

const steps = [
  {
    body: "Read-only OAuth integration with zero sync delays. We pull customer aging schedules without ever modifying your general ledger.",
    number: "1",
    title: "Connect in 60 seconds",
  },
  {
    body: "Every morning, one clear list of who to call, who to nudge, and pre-composed reminder drafts calibrated to invoice aging stages.",
    number: "2",
    title: "Open your daily queue",
  },
  {
    body: "Log call agreements, record promise dates, pause chasing on disputed invoices, and watch your overdue balance shrink every single week.",
    number: "3",
    title: "Collect cash without friction",
  },
];

const features = [
  {
    body: "Deterministic sorting orders invoices by broken promises, overdue duration, and amount, so you never guess who to nudge.",
    icon: (
      <>
        <path d="M9 6h11M9 12h11M9 18h11" />
        <path d="M4 6h.01M4 12h.01M4 18h.01" />
      </>
    ),
    title: "Daily Prioritized Queue",
  },
  {
    body: "From polite Day 1 friendly reminders to firm Day 30 escalation notices, pre-written and ready to send from your inbox.",
    icon: (
      <>
        <rect height="16" rx="2" width="20" x="2" y="4" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    title: "One-Click Reminder Drafts",
  },
  {
    body: "When a debtor says “we'll pay this Friday,” record it in seconds. If Friday passes without payment, they shoot to top priority.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    title: "Promise Tracking & Broken Alerts",
  },
  {
    body: "Client questioning scope? Freeze chasing instantly so your team never annoys a sensitive client during review.",
    icon: (
      <>
        <path d="M8 5v14M16 5v14" />
      </>
    ),
    title: "Dispute Management & Freeze",
  },
  {
    body: "Unlimited seats. Your finance manager, account director, and founder can log updates simultaneously without stepping on toes.",
    icon: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5" />
        <path d="M16 4.5a3.5 3.5 0 0 1 0 7M17.5 15.5c2 .8 3.5 2.4 4 4.5" />
      </>
    ),
    title: "Multi-User Team Handoff",
  },
  {
    body: "We strictly read invoices and customer contacts. We cannot touch your bank accounts or change your books.",
    icon: (
      <>
        <path d="M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    title: "Zero-Risk Read-Only Sync",
  },
];

const faqs = [
  {
    answer:
      "Never. ChaseUp connects with read-only accounting permissions and never writes invoices, payments, or customer records back to QuickBooks or Xero.",
    question: "Will ChaseUp alter my QuickBooks or Xero records?",
  },
  {
    answer:
      "Spreadsheets require manual data entry, go stale within hours, and don't flag when a debtor misses a promised payment deadline. ChaseUp turns chasing into an active morning ritual with zero manual record copying.",
    question: "Why not just use spreadsheets?",
  },
  {
    answer:
      "Yes. Every subscription includes unlimited users, and every call, promise, dispute, and reminder is logged against the invoice so anyone can pick up where the last person left off.",
    question: "Can multiple teammates work the queue?",
  },
  {
    answer:
      "Every new organization gets 14 days free, no card upfront. When the trial ends, subscribe for $99 a month flat, or your access pauses until you do. Billing actions are never locked — you can always subscribe or disconnect.",
    question: "How does the free trial work?",
  },
  {
    answer:
      "ChaseUp prepares each reminder with the right tone for its step and tracks it once you send it. You send from your own inbox for now, so customers always hear from you. Automatic sending is on the roadmap.",
    question: "Do reminders send automatically?",
  },
];

const included = [
  "Unlimited team members",
  "Unlimited connected invoices",
  "QuickBooks & Xero continuous sync",
  "Daily prioritized queue engine",
  "Pre-written reminder drafts",
  "Promise-to-pay tracker & freeze toggle",
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="fixed left-0 right-0 top-0 z-40 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" aria-label="ChaseUp home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            <a href="#how" className="hover:text-brand">
              How it works
            </a>
            <a href="#features" className="hover:text-brand">
              Features
            </a>
            <a href="#pricing" className="hover:text-brand">
              Pricing
            </a>
            <a href="#faq" className="hover:text-brand">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/signin" className="text-sm font-medium text-slate-600 hover:text-brand">
              Sign In
            </Link>
            <Link
              href="/signin"
              className="rounded-lg bg-brand px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-14">
        <section className="relative overflow-hidden bg-pine text-white">
          <div className="mx-auto max-w-6xl px-6 pb-16 pt-10 text-center sm:pt-14">
            <p className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-emerald-300">
              Built for agencies, consultancies & IT services
            </p>
            <h1 className="mx-auto mt-6 max-w-3xl animate-fade-up text-4xl font-bold tracking-tight sm:text-6xl">
              Overdue invoices chase{" "}
              <span className="font-serif font-normal italic text-emerald-300">themselves</span>.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
              Turn unpaid QuickBooks and Xero invoices into a calm, automated daily chasing
              workflow. No awkward calls, no messy spreadsheets.
            </p>
            <div className="mx-auto mt-8 flex max-w-md flex-col gap-3">
              <Link
                href="/signin"
                className="rounded-lg bg-brand px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-brand-dark"
              >
                Start Free Trial →
              </Link>
              <a
                href="#how"
                className="rounded-lg border border-white/15 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/15"
              >
                See How It Works
              </a>
            </div>
            <p className="mt-6 text-center text-sm text-slate-400">
              ✓ 14-day free trial · No credit card required · $99/mo flat · Cancel anytime
            </p>
            <LandingDashboardMock />
          </div>
        </section>

        <section className="border-b border-slate-200 bg-panel">
          <div className="mx-auto max-w-6xl px-6 py-6">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
              Connects read-only to your existing accounting stack
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
              {["QuickBooks", "Xero", "Paddle"].map((name) => (
                <span
                  key={name}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-ink shadow-sm"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-16">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">Workflow</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight">
              Turn chasing into a 5-minute morning habit
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-slate-600">
              Replace emotional collection anxiety with structured, deterministic execution.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-brand">
                    {step.number}
                  </span>
                  <h3 className="font-semibold tracking-tight">{step.title}</h3>
                </div>
                <p className="mt-2 pl-10 text-sm leading-relaxed text-slate-600">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="scroll-mt-24 bg-panel">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">Features</p>
              <h2 className="mt-1 text-3xl font-bold tracking-tight">
                Built for teams tired of polite spreadsheets
              </h2>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <Icon>{feature.icon}</Icon>
                  <h3 className="mt-3 font-semibold tracking-tight">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{feature.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-16">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">Pricing</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight">
              Simple flat pricing. Zero per-seat tax.
            </h2>
          </div>
          <div className="relative mx-auto mt-10 max-w-lg overflow-hidden rounded-2xl border-2 border-emerald-600/20 bg-white p-6 shadow-lg">
            <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-emerald-600/10 blur-xl" />
            <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-brand">
              All-Inclusive Agency Plan
            </span>
            <p className="mt-4 text-5xl font-bold tracking-tight">
              $99<span className="text-lg font-medium text-slate-500"> / month flat</span>
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Everything your agency or consultancy needs to collect overdue revenue
              systematically.
            </p>
            <ul className="mt-6 space-y-3 border-t border-slate-100 pt-6">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-brand"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/signin"
              className="mt-8 block rounded-lg bg-brand py-3.5 text-center text-sm font-semibold text-white shadow-md hover:bg-brand-dark"
            >
              Start Free Trial Now →
            </Link>
            <p className="mt-3 text-center text-xs text-slate-500">
              14-day free trial · No credit card upfront · Cancel anytime
            </p>
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 border-t border-slate-200 bg-panel">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">FAQ</p>
              <h2 className="mt-1 text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
            </div>
            <div className="mt-8 space-y-3">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold tracking-tight [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <span className="shrink-0 text-slate-400 transition-transform group-open:rotate-180">
                      ⌄
                    </span>
                  </summary>
                  <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-600">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-pine text-white">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <p className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-emerald-300">
              Recover cash this week
            </p>
            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
              Stop letting earned revenue sit unpaid.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-slate-300">
              Start your 14-day free trial today. Connect your accounting software in 60 seconds
              and see your recovery list instantly.
            </p>
            <Link
              href="/signin"
              className="mt-8 inline-block rounded-lg bg-brand px-6 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-brand-dark"
            >
              Get Started Free →
            </Link>
            <p className="mt-3 text-sm text-slate-400">No credit card required · Instant sync</p>
          </div>
          <footer className="border-t border-white/10">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8">
              <Logo dark />
              <p className="text-sm text-slate-400">
                Read-only accounting guarantee · © 2026 ChaseUp
              </p>
              <nav className="flex items-center gap-5 text-sm text-slate-300">
                <a href="#pricing" className="hover:text-white">
                  Pricing
                </a>
                <a href="#faq" className="hover:text-white">
                  FAQ
                </a>
                <Link href="/signin" className="hover:text-white">
                  Sign in
                </Link>
              </nav>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}
