import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/schema";

export const TRIAL_DAYS = 14;

export function trialEndsAt(organization: { createdAt: Date }) {
  return new Date(organization.createdAt.getTime() + TRIAL_DAYS * 86_400_000);
}

export function hasBillingAccess(
  organization: { createdAt: Date },
  subscription: { status: string } | null,
) {
  if (subscription && ["active", "past_due", "trialing"].includes(subscription.status)) {
    return true;
  }
  return new Date() < trialEndsAt(organization);
}

export async function requireBillingAccess(organization: { createdAt: Date; id: string }) {
  const subscription = await getOrgSubscription(organization.id);
  if (!hasBillingAccess(organization, subscription)) {
    redirect("/dashboard/billing");
  }
  return subscription;
}

export async function getOrgSubscription(organizationId: string) {
  const rows = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.organizationId, organizationId))
    .limit(1);
  return rows[0] ?? null;
}

export function isSubscriptionActive(status: string) {
  return status === "active" || status === "trialing";
}

const statusLabels: Record<string, string> = {
  active: "Active",
  canceled: "Canceled",
  past_due: "Past due",
  paused: "Paused",
  trialing: "Trialing",
};

export function subscriptionStatusLabel(status: string) {
  return statusLabels[status] ?? status;
}
