"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentOrganization } from "@/lib/organizations";
import { syncQuickBooks } from "@/lib/qbo-sync";
import {
  disconnectQuickBooks,
  getQuickBooksAuthorizationUrl,
  isQuickBooksConfigured,
} from "@/lib/quickbooks";
import { requireUser } from "@/lib/session";

export type QuickBooksState = {
  customers?: number;
  invoices?: number;
  status: "error" | "idle" | "no_connection" | "not_configured" | "ok";
};

export async function connectQuickBooksAction(
  _previous: QuickBooksState,
): Promise<QuickBooksState> {
  await requireUser();
  const organization = await getCurrentOrganization();
  if (!organization) {
    redirect("/onboarding");
  }
  if (!isQuickBooksConfigured()) {
    return { status: "not_configured" };
  }
  const url = getQuickBooksAuthorizationUrl(organization.id);
  if (!url) {
    return { status: "not_configured" };
  }
  redirect(url);
}

export async function syncQuickBooksAction(_previous: QuickBooksState): Promise<QuickBooksState> {
  await requireUser();
  const organization = await getCurrentOrganization();
  if (!organization) {
    redirect("/onboarding");
  }
  const result = await syncQuickBooks(organization.id);
  if (result.status === "ok") {
    revalidatePath("/dashboard");
    return { customers: result.customers, invoices: result.invoices, status: "ok" };
  }
  return { status: result.status };
}

export async function disconnectQuickBooksAction(
  _previous: QuickBooksState,
): Promise<QuickBooksState> {
  await requireUser();
  const organization = await getCurrentOrganization();
  if (!organization) {
    redirect("/onboarding");
  }
  await disconnectQuickBooks(organization.id);
  revalidatePath("/dashboard");
  return { status: "ok" };
}
