"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentOrganization } from "@/lib/organizations";
import { requireUser } from "@/lib/session";
import { requireBillingAccess } from "@/lib/billing";
import { syncXero } from "@/lib/xero-sync";
import {
  disconnectXero,
  getXeroAuthorizationUrl,
  isXeroConfigured,
} from "@/lib/xero";

export type XeroState = {
  customers?: number;
  invoices?: number;
  status: "error" | "idle" | "no_connection" | "not_configured" | "ok";
};

export async function connectXeroAction(_previous: XeroState): Promise<XeroState> {
  await requireUser();
  const organization = await getCurrentOrganization();
  if (!organization) {
    redirect("/onboarding");
  }
  await requireBillingAccess(organization);
  if (!isXeroConfigured()) {
    return { status: "not_configured" };
  }
  const url = getXeroAuthorizationUrl(organization.id);
  if (!url) {
    return { status: "not_configured" };
  }
  redirect(url);
}

export async function syncXeroAction(_previous: XeroState): Promise<XeroState> {
  await requireUser();
  const organization = await getCurrentOrganization();
  if (!organization) {
    redirect("/onboarding");
  }
  await requireBillingAccess(organization);
  const result = await syncXero(organization.id);
  if (result.status === "ok") {
    revalidatePath("/dashboard");
    return { customers: result.customers, invoices: result.invoices, status: "ok" };
  }
  return { status: result.status };
}

export async function disconnectXeroAction(_previous: XeroState): Promise<XeroState> {
  await requireUser();
  const organization = await getCurrentOrganization();
  if (!organization) {
    redirect("/onboarding");
  }
  await disconnectXero(organization.id);
  revalidatePath("/dashboard");
  return { status: "ok" };
}
