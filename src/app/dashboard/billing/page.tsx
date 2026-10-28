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
  "Unlimited users",
  "QuickBooks and Xero sync",
  "Daily call queue",
  "4-step reminder sequences",
  "Promise and dispute tracking",
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

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
      {!access && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-medium text-amber-900">Trial ended</p>
          <p className="mt-1 text-sm text-amber-800">
            {subscription
              ? "Your subscription is no longer active. Manage billing below to resubscribe."
              : "Your trial has ended. Subscribe below to keep using ChaseUp."}
          </p>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Plan">
          <p className="text-4xl font-bold tracking-tight">
            $99<span className="text-base font-medium text-slate-500"> / month</span>
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Flat, with unlimited users. One recovered invoice usually covers months of ChaseUp.
          </p>
          <ul className="mt-5 space-y-2.5">
            {planFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-700">
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
                {feature}
              </li>
            ))}
          </ul>
          {!subscription && access && (
            <p className="mt-5">
              <Pill tone="amber">
                Trial ends{" "}
                {trialEnd.toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Pill>
            </p>
          )}
        </Card>
        <Card title="Subscription">
          {subscription ? (
            <div className="flex flex-col gap-3">
              <Pill tone="emerald" className="self-start">
                {subscriptionStatusLabel(subscription.status)}
              </Pill>
              {subscription.currentPeriodEnd ? (
                <p className="text-sm text-slate-600">
                  Current period ends{" "}
                  {subscription.currentPeriodEnd.toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  .
                </p>
              ) : null}
              <div className="mt-2">{configured ? <ManageBillingForm /> : null}</div>
            </div>
          ) : configured ? (
            <SubscribeForm />
          ) : (
            <p className="text-sm text-slate-600">
              Billing setup is still in progress. Subscriptions will open here once it is ready.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
