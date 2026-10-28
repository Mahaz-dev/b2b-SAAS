import { and, eq, gt, lt, sql } from "drizzle-orm";
import Link from "next/link";
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
import { getCurrentUser } from "@/lib/session";
import { getXeroConnection, isXeroConfigured } from "@/lib/xero";

function formatSyncDate(date: Date | null) {
  return date
    ? date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
    : "never";
}

function Stat({
  label,
  value,
  sub,
  dot,
}: {
  label: string;
  value: string;
  sub?: string;
  dot?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_1px_2px_rgba(15,23,42,0.02)]">
      <p className="flex items-center justify-between text-xs font-medium text-slate-500">
        {label}
        {dot ? <span className={`h-2 w-2 rounded-full ${dot}`} /> : null}
      </p>
      <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">{value}</p>
      {sub ? <p className="mt-1.5 text-xs text-slate-500">{sub}</p> : null}
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
  const user = await getCurrentUser();
  const firstName = user?.name?.trim().split(/\s+/)[0];
  const members = await getOrganizationMembers(organization.id);
  const qboConnection = await getQboConnection(organization.id);
  const xeroConnection = await getXeroConnection(organization.id);
  const subscription = await getOrgSubscription(organization.id);
  const trialEnd = trialEndsAt(organization);
  const inTrial = !subscription && new Date() < trialEnd;
  const trialDaysLeft = Math.max(
    0,
    Math.ceil((trialEnd.getTime() - Date.now()) / 86_400_000),
  );
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Good morning{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-1 text-sm text-slate-600">Here is your collections pulse for today</p>
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
        <Stat
          label="Overdue Invoices"
          value={String(overdueCount)}
          dot={overdueCount > 0 ? "bg-rose-600" : "bg-emerald-600"}
          sub={
            overdueCount === 0
              ? "Nothing overdue right now"
              : `${overdueCount} ${overdueCount === 1 ? "invoice" : "invoices"} need chasing`
          }
        />
        <Stat label="Total Overdue" value={overdueValue} dot="bg-rose-600" />
        <Stat
          label="Invoices Synced"
          value={String(syncedTotal)}
          dot="bg-emerald-600"
          sub={
            syncedBySource.size > 0
              ? `Across ${syncedBySource.size} accounting ${syncedBySource.size === 1 ? "tool" : "tools"}`
              : "Connect QuickBooks or Xero"
          }
        />
        <Stat
          label="Plan Status"
          value={subscription ? "$99 / mo" : `${trialDaysLeft} Days Left`}
          sub={
            subscription
              ? `Renews ${subscription.currentPeriodEnd ? subscription.currentPeriodEnd.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "soon"}`
              : inTrial
                ? "$99/mo flat after trial"
                : "Trial ended"
          }
        />
      </div>
      <div className="rounded-xl bg-pine p-5 text-white shadow-sm sm:p-6">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Daily Priority Task
        </p>
        <h2 className="mt-3 text-xl font-bold tracking-tight">
          Ready to clear today&apos;s overdue cash?
        </h2>
        <p className="mt-1.5 text-sm text-slate-300">
          {overdueCount === 0
            ? "Your queue is clear. New overdue invoices will appear here automatically."
            : `You have ${overdueCount} ${overdueCount === 1 ? "call" : "calls"} waiting in your queue.`}
        </p>
        <Link
          href="/dashboard/queue"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark"
        >
          Start Today&apos;s Queue ({overdueCount}) →
        </Link>
      </div>
      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-bold tracking-tight">Connected Ledgers</h2>
          <span className="text-sm text-slate-500">
            {[qboConnection, xeroConnection].filter(Boolean).length} Active
          </span>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-panel text-sm font-bold text-brand">
                QB
              </span>
              <div>
                <h3 className="font-semibold tracking-tight">QuickBooks Online</h3>
                <p className="text-sm text-slate-500">
                  {qboConnection ? "● Connected · Active" : "Not connected"}
                </p>
              </div>
            </div>
            {qboConnection ? (
              <>
                <p className="mt-3 text-sm text-slate-600">
                  {syncedBySource.get("quickbooks") ?? 0} invoices synced · Last synced{" "}
                  {formatSyncDate(qboConnection.lastSyncedAt)}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                  <SyncQuickBooksForm />
                  <DisconnectQuickBooksForm />
                </div>
              </>
            ) : isQuickBooksConfigured() ? (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <ConnectQuickBooksForm />
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                QuickBooks setup is still in progress. Connections will open here once it is
                ready.
              </p>
            )}
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-panel text-sm font-bold text-brand">
                XR
              </span>
              <div>
                <h3 className="font-semibold tracking-tight">Xero</h3>
                <p className="text-sm text-slate-500">
                  {xeroConnection
                    ? `● Connected${xeroConnection.tenantName ? ` · ${xeroConnection.tenantName}` : ""}`
                    : "Not connected"}
                </p>
              </div>
            </div>
            {xeroConnection ? (
              <>
                <p className="mt-3 text-sm text-slate-600">
                  {syncedBySource.get("xero") ?? 0} invoices synced · Last synced{" "}
                  {formatSyncDate(xeroConnection.lastSyncedAt)}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                  <SyncXeroForm />
                  <DisconnectXeroForm />
                </div>
              </>
            ) : isXeroConfigured() ? (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <ConnectXeroForm />
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                Xero setup is still in progress. Connections will open here once it is ready.
              </p>
            )}
          </Card>
        </div>
      </div>
      <Card title="Workspace Members">
        <ul className="flex flex-col gap-3">
          {members.map(({ membership, user }) => {
            const name = user.name ?? user.email ?? "Member";
            return (
              <li key={membership.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${avatarToneFor(name)}`}
                  >
                    {initialsFor(name)}
                  </span>
                  <span>
                    <span className="block font-medium">{name}</span>
                    <span className="block text-xs text-slate-500">
                      {user.email ?? "No email"}
                    </span>
                  </span>
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
