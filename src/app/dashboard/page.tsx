import { and, eq, gt, lt, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import {
  ConnectQuickBooksForm,
  DisconnectQuickBooksForm,
  SyncQuickBooksForm,
} from "@/components/quickbooks-forms";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { getCurrentOrganization, getOrganizationMembers } from "@/lib/organizations";
import { getQboConnection, isQuickBooksConfigured } from "@/lib/quickbooks";
import { qboInvoices } from "@/lib/schema";
import { requireBillingAccess } from "@/lib/billing";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ quickbooks?: string }>;
}) {
  const organization = await getCurrentOrganization();
  if (!organization) {
    redirect("/onboarding");
  }
  await requireBillingAccess(organization);
  const params = await searchParams;
  const members = await getOrganizationMembers(organization.id);
  const connection = await getQboConnection(organization.id);
  const configured = isQuickBooksConfigured();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const overdueRows = await db
    .select({
      count: sql<number>`count(*)`,
      currency: qboInvoices.currency,
      total: sql<number>`coalesce(sum(${qboInvoices.balance}), 0)`,
    })
    .from(qboInvoices)
    .where(
      and(
        eq(qboInvoices.organizationId, organization.id),
        gt(qboInvoices.balance, 0),
        lt(qboInvoices.dueDate, today),
      ),
    )
    .groupBy(qboInvoices.currency);
  const overdueCount = overdueRows.reduce((sum, row) => sum + Number(row.count), 0);
  const syncedRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(qboInvoices)
    .where(eq(qboInvoices.organizationId, organization.id));
  const syncedCount = Number(syncedRows[0]?.count ?? 0);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">{organization.name}</h1>
      {params.quickbooks === "error" && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          QuickBooks connection failed. Try again.
        </p>
      )}
      <Card title="Overdue invoices">
        {!connection ? (
          <p className="text-sm text-slate-600">
            No invoices synced yet. Connect QuickBooks to see what is overdue here.
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
        {connection ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-600">
              Connected · {syncedCount} {syncedCount === 1 ? "invoice" : "invoices"} synced · last
              synced{" "}
              {connection.lastSyncedAt
                ? connection.lastSyncedAt.toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "never"}
              .
            </p>
            <div className="flex flex-wrap items-start gap-3">
              <SyncQuickBooksForm />
              <DisconnectQuickBooksForm />
            </div>
          </div>
        ) : configured ? (
          <ConnectQuickBooksForm />
        ) : (
          <p className="text-sm text-slate-600">
            QuickBooks setup is still in progress. Connections will open here once it is ready.
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
