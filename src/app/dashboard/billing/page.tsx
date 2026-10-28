import { redirect } from "next/navigation";
import { ManageBillingForm, SubscribeForm } from "@/components/billing-forms";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import {
  getOrgSubscription,
  hasBillingAccess,
  subscriptionStatusLabel,
  trialEndsAt,
} from "@/lib/billing";
import { getCurrentOrganization } from "@/lib/organizations";
import { isPaddleConfigured } from "@/lib/paddle";

const planFeatures = [
  "Unlimited team members & seats",
  "Real-time QuickBooks & Xero sync",
  "Automated daily calling queue",
  "Prepared reminder sequence (Day 1 to Day 30)",
  "Promise tracking & broken promise alerts",
  "Dispute pausing & full audit history",
];

export default async function BillingPage() {
  const organization = await getCurrentOrganization();
  if (!organization) {
    redirect("/onboarding");
  }
  const subscription = await getOrgSubscription(organization.id);
  const configured = isPaddleConfigured();
  const access = hasBillingAccess(organization, subscription);
  const trialEnd = trialEndsAt(organization);
  const trialDaysLeft = Math.max(
    0,
    Math.ceil((trialEnd.getTime() - Date.now()) / 86_400_000),
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand">
          Account Overview
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          <span className="font-semibold normal-case tracking-normal text-slate-500">
            Flat pricing
          </span>
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="mt-1 text-sm text-slate-600">
          Simple flat pricing with unlimited team access
        </p>
      </div>
      <section className="relative overflow-hidden rounded-xl border-2 border-emerald-600/25 bg-white p-5 shadow-sm">
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-600/5 blur-xl" />
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand">Active Tier</p>
            <h2 className="mt-0.5 text-lg font-bold tracking-tight">
              {subscription ? "Pro Plan" : "Pro Plan Trial"}
            </h2>
          </div>
          {!subscription && access && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-panel px-2.5 py-1 text-xs font-semibold text-brand">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
              {trialDaysLeft} days remaining
            </span>
          )}
          {subscription && <Pill tone="emerald">{subscriptionStatusLabel(subscription.status)}</Pill>}
        </div>
        <div className="mt-4 rounded-lg border border-slate-200 bg-panel p-3.5">
          <p className="text-2xl font-bold tabular-nums tracking-tight">
            $99<span className="text-base font-medium text-slate-500"> / month flat</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Billed monthly via Paddle. No surprise seat costs.
          </p>
        </div>
        <div className="mt-5 space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Plan Inclusions
          </p>
          {planFeatures.map((feature) => (
            <p key={feature} className="flex items-start gap-2.5 text-sm text-ink">
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
              {feature}
            </p>
          ))}
        </div>
        {!subscription && (
          <div className="mt-5">
            {configured ? (
              <SubscribeForm />
            ) : (
              <p className="text-sm text-slate-600">
                Billing setup is still in progress. Subscriptions will open here once it is ready.
              </p>
            )}
          </div>
        )}
        <p className="mt-3 text-center text-xs text-slate-500">
          Cancel anytime from the billing page.
        </p>
      </section>
      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-semibold tracking-tight">Invoicing Details</h3>
            <p className="text-xs text-slate-500">Billing cadence and registered cards</p>
          </div>
          <Pill tone="slate">Monthly</Pill>
        </div>
        <div className="mt-3 space-y-3 text-sm">
          <p className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-slate-500">Subscription Status</span>
            <span className="font-semibold text-ink">
              {subscription
                ? subscriptionStatusLabel(subscription.status)
                : access
                  ? `Trial Active (Ending ${trialEnd.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })})`
                  : "Trial Ended"}
            </span>
          </p>
          <p className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-slate-500">Next billing date</span>
            <span className="font-semibold tabular-nums text-ink">
              {subscription?.currentPeriodEnd
                ? subscription.currentPeriodEnd.toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : trialEnd.toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
            </span>
          </p>
          <p className="flex items-center justify-between">
            <span className="text-slate-500">Payment method</span>
            <span className="font-medium text-slate-500">
              {subscription ? "Managed via Paddle" : "None required yet"}
            </span>
          </p>
        </div>
        {subscription && configured && (
          <div className="mt-4">
            <ManageBillingForm />
          </div>
        )}
      </Card>
      {!access && (
        <section className="rounded-xl border border-rose-200 bg-white p-4 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-700">
            <span className="h-2 w-2 rounded-full bg-rose-600" />
            Trial Ended
          </p>
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3.5">
            <p className="text-sm leading-relaxed text-ink">
              Your 14-day trial has ended. Subscribe now to unpause your daily chasing queue and
              keep your cash flow moving.
            </p>
            <div className="mt-3">
              {configured ? (
                <SubscribeForm />
              ) : (
                <p className="text-sm text-slate-600">
                  Billing setup is still in progress. Subscriptions will open here once it is
                  ready.
                </p>
              )}
            </div>
          </div>
        </section>
      )}
      <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-panel p-3.5">
        <p className="text-sm leading-relaxed text-slate-600">
          <strong className="font-medium text-ink">Paddle secures all transactions.</strong>{" "}
          Cancel anytime with one click. Read-only accounting guarantee.
        </p>
      </div>
    </div>
  );
}
