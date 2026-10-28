import { WaitlistForm } from "@/components/waitlist-form";

const features = [
  {
    body: "Polite, then firm, then final. Sequences run on their own and stop the moment payment lands.",
    title: "Automatic sequences",
  },
  {
    body: "Broken promises first, then highest amount times days overdue. No spreadsheet, no guessing.",
    title: "Who to call today",
  },
  {
    body: "Record a promised date and ChaseUp flags it when it breaks. Open a dispute and reminders pause.",
    title: "Promises and disputes",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6">
      <header className="flex items-center justify-between py-6">
        <span className="text-lg font-bold tracking-tight">ChaseUp</span>
        <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Pricing
        </a>
      </header>

      <section className="py-16 sm:py-24">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Overdue invoices chase themselves.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-slate-600">
          ChaseUp connects to QuickBooks or Xero, sends the follow-ups, and tells you exactly who
          to call today — so the money you are owed stops sitting for 30, 60, 90 days.
        </p>
        <div className="mt-8">
          <WaitlistForm />
        </div>
      </section>

      <section className="grid gap-6 border-t border-slate-200 py-12 sm:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title}>
            <h2 className="font-semibold">{feature.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.body}</p>
          </div>
        ))}
      </section>

      <section id="pricing" className="border-t border-slate-200 py-12">
        <h2 className="text-2xl font-bold tracking-tight">One price. No seats.</h2>
        <p className="mt-3 max-w-lg text-slate-600">
          $99 a month, flat, with unlimited users. One recovered invoice usually covers months of
          ChaseUp.
        </p>
        <p className="mt-4 text-3xl font-bold">
          $99<span className="text-base font-medium text-slate-500"> / month</span>
        </p>
      </section>

      <footer className="border-t border-slate-200 py-8 text-sm text-slate-500">
        Built for B2B service firms on QuickBooks and Xero. © 2026 ChaseUp.
      </footer>
    </main>
  );
}
