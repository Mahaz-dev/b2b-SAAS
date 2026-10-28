import Link from "next/link";
import { LandingDashboardMock } from "@/components/landing-dashboard-mock";
import { Logo } from "@/components/logo";

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
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
    body: "Connect QuickBooks or Xero in a few clicks. ChaseUp reads invoices and customers — it never writes to your books.",
    number: "01",
    title: "Connect your accounting",
  },
  {
    body: "Invoices sync every day. Overdue balances, due dates, and customer details stay current without a spreadsheet.",
    number: "02",
    title: "Invoices sync daily",
  },
  {
    body: "Open the call queue each morning: broken promises first, then the biggest amounts times days overdue. Send the next reminder from the prepared draft.",
    number: "03",
    title: "Work the queue",
  },
];

const features = [
  {
    body: "Broken promises first, then amount times days overdue. No spreadsheet, no guessing, no chasing the wrong invoice.",
    icon: (
      <>
        <path d="M9 6h11M9 12h11M9 18h11" />
        <path d="M4 6h.01M4 12h.01M4 18h.01" />
      </>
    ),
    title: "Who to call today",
  },
  {
    body: "Friendly on day 1, firm on day 7, final notice on day 14, escalation on day 30. Sequences stop the moment payment lands.",
    icon: (
      <>
        <rect height="16" rx="2" width="20" x="2" y="4" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    title: "Escalating reminders",
  },
  {
    body: "Record a promised date and ChaseUp flags it the day it breaks. Open a dispute and reminders pause until it is resolved.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    title: "Promises and disputes",
  },
  {
    body: "Every call, promise, dispute, and reminder is logged against the invoice, so anyone on your team can pick up where the last person left off.",
    icon: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
      </>
    ),
    title: "Full activity log",
  },
  {
    body: "Every invoice, customer, and sync status in one searchable list, with Paid, Overdue, and Open badges at a glance.",
    icon: (
      <>
        <path d="M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    title: "Read-only by design",
  },
  {
    body: "One flat price, unlimited users, no per-seat billing, no setup fees. A 14-day trial with no card upfront.",
    icon: (
      <>
        <path d="M20 6 9 17l-5-5" />
      </>
    ),
    title: "One price, no seats",
  },
];

const faqs = [
  {
    answer:
      "Every new organization gets 14 days free, no card upfront. When the trial ends, subscribe for $99 a month flat, or your access pauses until you do. Billing actions are never locked — you can always subscribe or disconnect.",
    question: "How does the free trial work?",
  },
  {
    answer:
      "No. ChaseUp connects with read-only accounting permissions and never writes invoices, payments, or customer records back to QuickBooks or Xero.",
    question: "Does ChaseUp change anything in my books?",
  },
  {
    answer:
      "QuickBooks Online and Xero. Connect one or both — invoices from each flow into the same call queue, and disconnecting one provider removes only its own data.",
    question: "Which accounting tools does it support?",
  },
  {
    answer:
      "ChaseUp prepares each reminder with the right tone for its step and tracks it once you send it. You send from your own inbox for now, so customers always hear from you. Automatic sending is on the roadmap.",
    question: "Do reminders send automatically?",
  },
  {
    answer:
      "Yes, anytime from the billing page. There are no contracts and no cancellation fees, and your data stays exportable through your accounting system.",
    question: "Can I cancel anytime?",
  },
];

const included = [
  "Unlimited users, one flat price",
  "QuickBooks and Xero sync",
  "Daily call queue, broken promises first",
  "4-step escalating reminder sequences",
  "Promise-to-pay and dispute tracking",
  "Full activity log per invoice",
  "Daily automatic sync",
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" aria-label="ChaseUp home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            <a href="#how" className="hover:text-slate-950">
              How it works
            </a>
            <a href="#features" className="hover:text-slate-950">
              Features
            </a>
            <a href="#pricing" className="hover:text-slate-950">
              Pricing
            </a>
            <a href="#faq" className="hover:text-slate-950">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="text-sm font-medium text-slate-600 hover:text-slate-950"
            >
              Sign in
            </Link>
            <Link
              href="/signin"
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-slate-950">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 text-center sm:pt-24">
          <p className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-emerald-300">
            Now with Xero support
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl animate-fade-up text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Overdue invoices{" "}
            <span className="font-serif text-emerald-300">chase themselves.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
            ChaseUp connects to QuickBooks or Xero, sends the follow-ups, and tells you exactly
            who to call today — so the money you are owed stops sitting for 30, 60, 90 days.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signin"
              className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600"
            >
              Start free trial
            </Link>
            <a
              href="#how"
              className="rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              See how it works
            </a>
          </div>
          <p className="mt-5 text-sm text-slate-400">
            14-day free trial · No card required · $99/mo flat · Cancel anytime
          </p>
          <LandingDashboardMock />
        </div>
      </section>

      <section className="border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-6 py-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Connects with
          </span>
          {["QuickBooks Online", "Xero", "Paddle billing"].map((name) => (
            <span
              key={name}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-sm font-medium text-slate-700"
            >
              {name}
            </span>
          ))}
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-20">
        <h2 className="text-3xl font-bold tracking-tight">From overdue to paid, in three steps</h2>
        <p className="mt-3 max-w-xl text-slate-600">
          No new workflow to learn. Connect once, then open one list every morning.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="rounded-2xl border border-slate-200 p-6">
              <span className="text-3xl font-bold text-emerald-600">{step.number}</span>
              <h3 className="mt-4 font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="scroll-mt-24 border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold tracking-tight">Everything chasing needs, nothing it does not</h2>
          <p className="mt-3 max-w-xl text-slate-600">
            Built for B2B service firms that are tired of spreadsheets and sticky notes.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-6">
                <Icon>{feature.icon}</Icon>
                <h3 className="mt-4 font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-20">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="text-3xl font-bold tracking-tight">One price. No seats.</h2>
          <p className="mt-3 text-slate-600">
            One recovered invoice usually covers months of ChaseUp.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-lg rounded-3xl border-2 border-slate-950 bg-white p-8 shadow-xl shadow-slate-950/5">
          <p className="text-sm font-medium text-slate-500">ChaseUp plan</p>
          <p className="mt-3 text-5xl font-bold tracking-tight">
            $99<span className="text-lg font-medium text-slate-500"> / month</span>
          </p>
          <p className="mt-2 text-sm text-slate-600">Flat. Unlimited users. 14-day free trial, no card.</p>
          <ul className="mt-6 space-y-3">
            {included.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
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
            className="mt-8 block rounded-xl bg-slate-950 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800"
          >
            Start free trial
          </Link>
          <p className="mt-3 text-center text-xs text-slate-500">
            No setup fees. Cancel anytime from the billing page.
          </p>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="text-3xl font-bold tracking-tight">Questions, answered</h2>
          <div className="mt-8 space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-slate-200 bg-white px-5 py-4"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium tracking-tight [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span className="shrink-0 text-xl text-slate-400 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Stop chasing. <span className="font-serif text-emerald-300">Start collecting.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-slate-300">
            Connect QuickBooks or Xero today and see your call queue tomorrow morning.
          </p>
          <Link
            href="/signin"
            className="mt-8 inline-block rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600"
          >
            Start free trial
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8">
          <Logo />
          <p className="text-sm text-slate-500">
            Built for B2B service firms on QuickBooks and Xero. © 2026 ChaseUp.
          </p>
          <nav className="flex items-center gap-5 text-sm text-slate-600">
            <a href="#pricing" className="hover:text-slate-950">
              Pricing
            </a>
            <a href="#faq" className="hover:text-slate-950">
              FAQ
            </a>
            <Link href="/signin" className="hover:text-slate-950">
              Sign in
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
