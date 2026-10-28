"use server";

import { redirect } from "next/navigation";
import { getOrgSubscription } from "@/lib/billing";
import { env } from "@/lib/env";
import { getCurrentOrganization } from "@/lib/organizations";
import { getPaddleClient, isPaddleConfigured } from "@/lib/paddle";
import { requireUser } from "@/lib/session";

export type BillingState = {
  status: "error" | "idle" | "no_subscription" | "not_configured";
};

export async function createCheckoutAction(_previous: BillingState): Promise<BillingState> {
  await requireUser();
  const organization = await getCurrentOrganization();
  if (!organization) {
    redirect("/onboarding");
  }
  if (!isPaddleConfigured() || !env.PADDLE_PRICE_ID) {
    return { status: "not_configured" };
  }
  const client = getPaddleClient();
  if (!client) {
    return { status: "not_configured" };
  }
  const existing = await getOrgSubscription(organization.id);
  try {
    const transaction = await client.transactions.create({
      customData: { organization_id: organization.id },
      items: [{ priceId: env.PADDLE_PRICE_ID, quantity: 1 }],
      ...(existing ? { customerId: existing.paddleCustomerId } : {}),
    });
    const url = transaction.checkout?.url;
    if (!url) {
      return { status: "error" };
    }
    redirect(url);
  } catch {
    return { status: "error" };
  }
}

export async function createPortalSessionAction(_previous: BillingState): Promise<BillingState> {
  await requireUser();
  const organization = await getCurrentOrganization();
  if (!organization) {
    redirect("/onboarding");
  }
  if (!isPaddleConfigured()) {
    return { status: "not_configured" };
  }
  const client = getPaddleClient();
  if (!client) {
    return { status: "not_configured" };
  }
  const subscription = await getOrgSubscription(organization.id);
  if (!subscription) {
    return { status: "no_subscription" };
  }
  try {
    const session = await client.customerPortalSessions.create(subscription.paddleCustomerId, [
      subscription.paddleSubscriptionId,
    ]);
    redirect(session.urls.general.overview);
  } catch {
    return { status: "error" };
  }
}
