import { redirect } from "next/navigation";
import { ManageBillingForm, SubscribeForm } from "@/components/billing-forms";
import { Card } from "@/components/ui/card";
import { getOrgSubscription, subscriptionStatusLabel } from "@/lib/billing";
import { getCurrentOrganization } from "@/lib/organizations";
import { isPaddleConfigured } from "@/lib/paddle";

export default async function BillingPage() {
  const organization = await getCurrentOrganization();
  if (!organization) {
    redirect("/onboarding");
  }
  const subscription = await getOrgSubscription(organization.id);
  const configured = isPaddleConfigured();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
      <Card title="Plan">
        <p className="text-sm text-slate-600">
          $99 a month, flat, with unlimited users. One recovered invoice usually covers months of
          ChaseUp.
        </p>
        <p className="mt-4 text-3xl font-bold">
          $99<span className="text-base font-medium text-slate-500"> / month</span>
        </p>
      </Card>
      {subscription ? (
        <Card title="Subscription">
          <p className="text-sm text-slate-600">
            Status: <span className="font-medium text-slate-900">{subscriptionStatusLabel(subscription.status)}</span>
          </p>
          {subscription.currentPeriodEnd ? (
            <p className="mt-1 text-sm text-slate-600">
              Current period ends{" "}
              {subscription.currentPeriodEnd.toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              .
            </p>
          ) : null}
          <div className="mt-4">{configured ? <ManageBillingForm /> : null}</div>
        </Card>
      ) : (
        <Card title="Subscription">
          {configured ? (
            <SubscribeForm />
          ) : (
            <p className="text-sm text-slate-600">
              Billing setup is still in progress. Subscriptions will open here once it is ready.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
