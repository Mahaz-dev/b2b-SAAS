import { and, eq, gt, lt, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import {
  ConnectQuickBooksForm,
  DisconnectQuickBooksForm,
  SyncQuickBooksForm,
} from "@/components/quickbooks-forms";
import {
  ConnectXeroForm,
  DisconnectXeroForm,
  SyncXeroForm,
} from "@/components/xero-forms";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { getCurrentOrganization, getOrganizationMembers } from "@/lib/organizations";
import { getQboConnection, isQuickBooksConfigured } from "@/lib/quickbooks";
import { invoices } from "@/lib/schema";
import { getOrgSubscription, requireBillingAccess, trialEndsAt } from "@/lib/billing";
import { getXeroConnection, isXeroConfigured } from "@/lib/xero";

function formatSyncDate(date: Date | null) {
  return date
    ? date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
    : "never";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ quickbooks?: string; xero?: string }>;
}) {
  const organization = await getCurrentOrganization();
  if (!organization) {
    redirect("/onboarding");
  }
  await requireBillingAccess(organization);
  const params = await searchParams;
  const members = await getOrganizationMembers(organization.id);
  const qboConnection = await getQboConnection(organization.id);
  const xeroConnection = await getXeroConnection(organization.id);
  const subscription = await getOrgSubscription(organization.id);
  const trialEnd = trialEndsAt(organization);
  const inTrial = !subscription && new Date() < trialEnd;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const overdueRows = await db
    .select({
      count: sql<number>`count(*)`,
      currency: invoices.currency,
      total: sql<number>`coalesce(sum(${invoices.balance}), 0)`,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.organizationId, organization.id),
        gt(invoices.balance, 0),
        lt(invoices.dueDate, today),
      ),
    )
    .groupBy(invoices.currency);
  const overdueCount = overdueRows.reduce((sum, row) => sum + Number(row.count), 0);
  const syncedCounts = await db
    .select({ count: sql<number>`count(*)`, source: invoices.source })
    .from(invoices)
    .where(eq(invoices.organizationId, organization.id))
    .groupBy(invoices.source);
  const syncedBySource = new Map(syncedCounts.map((row) => [row.source, Number(row.count)]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{organization.name}</h1>
        {inTrial && (
          <p className="mt-1 text-sm text-slate-600">
            Trial ends{" "}
            {trialEnd.toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            .
          </p>
        )}
      </div>
      {params.quickbooks === "error" && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          QuickBooks connection failed. Try again.
        </p>
      )}
      {params.xero === "error" && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Xero connection failed. Try again.
        </p>
      )}
      <Card title="Overdue invoices">
        {!qboConnection && !xeroConnection ? (
          <p className="text-sm text-slate-600">
            No invoices synced yet. Connect QuickBooks or Xero to see what is overdue here.
          </p>
        ) : overdueCount === 0 ? (
          <p className="text-sm text-slate-600">No overdue invoices right now.</p>
        ) : overdueRows.length === 1 ? (
          <p className="text-sm text-slate-600">
            {overdueCount} overdue {overdueCount === 1 ? "invoice" : "invoices"} · total{" "}
            {formatMoney(Number(overdueRows[0].total), overdueRows[0].currency)}.
          </p>
        ) : (
          <p className="text-sm text-slate-600">
            {overdueCount} overdue invoices across {overdueRows.length} currencies.
          </p>
        )}
      </Card>
      <Card title="QuickBooks">
        {qboConnection ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-600">
              Connected · {syncedBySource.get("quickbooks") ?? 0} invoices synced · last synced{" "}
              {formatSyncDate(qboConnection.lastSyncedAt)}.
            </p>
            <div className="flex flex-wrap items-start gap-3">
              <SyncQuickBooksForm />
              <DisconnectQuickBooksForm />
            </div>
          </div>
        ) : isQuickBooksConfigured() ? (
          <ConnectQuickBooksForm />
        ) : (
          <p className="text-sm text-slate-600">
            QuickBooks setup is still in progress. Connections will open here once it is ready.
          </p>
        )}
      </Card>
      <Card title="Xero">
        {xeroConnection ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-600">
              Connected{xeroConnection.tenantName ? ` to ${xeroConnection.tenantName}` : ""} ·{" "}
              {syncedBySource.get("xero") ?? 0} invoices synced · last synced{" "}
              {formatSyncDate(xeroConnection.lastSyncedAt)}.
            </p>
            <div className="flex flex-wrap items-start gap-3">
              <SyncXeroForm />
              <DisconnectXeroForm />
            </div>
          </div>
        ) : isXeroConfigured() ? (
          <ConnectXeroForm />
        ) : (
          <p className="text-sm text-slate-600">
            Xero setup is still in progress. Connections will open here once it is ready.
          </p>
        )}
      </Card>
      <Card title="Members">
        <ul className="flex flex-col gap-2">
          {members.map(({ membership, user }) => (
            <li key={membership.id} className="flex items-center justify-between text-sm">
              <span>{user.name ?? user.email ?? "Member"}</span>
              <span className="text-slate-500">{membership.role}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
