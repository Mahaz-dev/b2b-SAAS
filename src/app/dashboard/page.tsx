import { and, eq, gt, lt, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
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
import { avatarToneFor, formatMoney, initialsFor } from "@/lib/format";
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

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      {sub ? <p className="mt-1 text-xs text-slate-500">{sub}</p> : null}
    </div>
  );
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
  const syncedTotal = [...syncedBySource.values()].reduce((sum, count) => sum + count, 0);
  const overdueValue =
    overdueRows.length === 1
      ? formatMoney(Number(overdueRows[0].total), overdueRows[0].currency)
      : overdueRows.length > 1
        ? `Across ${overdueRows.length} currencies`
        : "—";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{organization.name}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {qboConnection || xeroConnection
              ? "Your invoices are syncing. Start with the call queue."
              : "Connect QuickBooks or Xero to start chasing."}
          </p>
        </div>
        {inTrial ? (
          <Pill tone="amber">
            Trial ends{" "}
            {trialEnd.toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Pill>
        ) : subscription ? (
          <Pill tone="emerald">Subscription {subscription.status}</Pill>
        ) : null}
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Overdue invoices" value={String(overdueCount)} />
        <Stat label="Total overdue" value={overdueValue} />
        <Stat label="Invoices synced" value={String(syncedTotal)} />
        <Stat
          label="Plan"
          value={subscription ? "$99 / month" : "Free trial"}
          sub={
            subscription
              ? `Renews ${subscription.currentPeriodEnd ? subscription.currentPeriodEnd.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "soon"}`
              : inTrial
                ? `${Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / 86_400_000))} days left`
                : "Trial ended"
          }
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="QuickBooks">
          {qboConnection ? (
            <div className="flex flex-col gap-4">
              <Pill tone="emerald" className="self-start">
                Connected
              </Pill>
              <p className="text-sm text-slate-600">
                {syncedBySource.get("quickbooks") ?? 0} invoices synced · last synced{" "}
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
              <Pill tone="emerald" className="self-start">
                Connected{xeroConnection.tenantName ? ` · ${xeroConnection.tenantName}` : ""}
              </Pill>
              <p className="text-sm text-slate-600">
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
      </div>
      <Card title="Members">
        <ul className="flex flex-col gap-3">
          {members.map(({ membership, user }) => {
            const name = user.name ?? user.email ?? "Member";
            return (
              <li key={membership.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${avatarToneFor(name)}`}
                  >
                    {initialsFor(name)}
                  </span>
                  {name}
                </span>
                <Pill tone="slate">{membership.role}</Pill>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
