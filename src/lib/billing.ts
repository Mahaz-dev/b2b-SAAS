import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/schema";

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
