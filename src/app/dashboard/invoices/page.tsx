import { and, asc, eq, ilike, or } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pill } from "@/components/ui/pill";
import { db } from "@/lib/db";
import { avatarToneFor, formatMoney, initialsFor } from "@/lib/format";
import { getCurrentOrganization } from "@/lib/organizations";
import { disputes, invoices } from "@/lib/schema";
import { requireBillingAccess } from "@/lib/billing";

const sourceLabels: Record<string, string> = {
  quickbooks: "QuickBooks",
  xero: "Xero",
};

type Status = "all" | "disputed" | "open" | "overdue" | "paid";

function displayStatus(
  balance: number,
  dueDate: Date | null,
  today: Date,
  isDisputed: boolean,
): { key: Status; label: string; tone: "amber" | "emerald" | "red" | "slate"; rail: string } {
  if (isDisputed) {
    return { key: "disputed", label: "Disputed", tone: "slate", rail: "bg-slate-300" };
  }
  if (balance <= 0) {
    return { key: "paid", label: "Paid", tone: "emerald", rail: "bg-emerald-600" };
  }
  if (dueDate && dueDate < today) {
    return { key: "overdue", label: "Overdue", tone: "red", rail: "bg-rose-600" };
  }
  return { key: "open", label: "Open", tone: "slate", rail: "bg-slate-300" };
}

function groupTotal(rows: { balance: number; currency: string | null }[]) {
  const currencies = new Set(rows.map((row) => row.currency));
  if (rows.length === 0) return "—";
  if (currencies.size === 1) {
    const total = rows.reduce((sum, row) => sum + row.balance, 0);
    return formatMoney(total, rows[0].currency);
  }
  return `Across ${currencies.size} currencies`;
}

function chipHref(
  base: { q: string; source: string; status: Status },
  patch: Partial<{ q: string; source: string; status: Status }>,
) {
  const next = { ...base, ...patch };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.status !== "all") params.set("status", next.status);
  if (next.source !== "all") params.set("source", next.source);
  const query = params.toString();
  return query ? `/dashboard/invoices?${query}` : "/dashboard/invoices";
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; source?: string; status?: string }>;
}) {
  const organization = await getCurrentOrganization();
  if (!organization) {
    redirect("/onboarding");
  }
  await requireBillingAccess(organization);
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const status: Status =
    params.status === "overdue" ||
    params.status === "open" ||
    params.status === "paid" ||
    params.status === "disputed"
      ? params.status
      : "all";
  const source = params.source === "quickbooks" || params.source === "xero" ? params.source : "all";
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const allRows = await db
    .select()
    .from(invoices)
    .where(eq(invoices.organizationId, organization.id));
  const openDisputes = await db
    .select()
    .from(disputes)
    .where(eq(disputes.organizationId, organization.id));
  const disputedIds = new Set(
    openDisputes.filter((dispute) => !dispute.resolvedAt).map((dispute) => dispute.invoiceId),
  );
  const withStatus = allRows.map((invoice) => ({
    invoice,
    status: displayStatus(
      invoice.balance,
      invoice.dueDate,
      today,
      disputedIds.has(invoice.id),
    ),
  }));
  const groups = {
    open: withStatus.filter((row) => row.status.key === "open").map((row) => row.invoice),
    overdue: withStatus.filter((row) => row.status.key === "overdue").map((row) => row.invoice),
    paid: withStatus.filter((row) => row.status.key === "paid").map((row) => row.invoice),
  };

  const filtered = withStatus.filter((row) => {
    if (status !== "all" && row.status.key !== status) return false;
    if (source !== "all" && row.invoice.source !== source) return false;
    if (query) {
      const haystack = `${row.invoice.customerName ?? ""} ${row.invoice.docNumber ?? ""}`.toLowerCase();
      if (!haystack.includes(query.toLowerCase())) return false;
    }
    return true;
  });
  const sorted = [...filtered].sort((a, b) => {
    const aTime = a.invoice.dueDate?.getTime() ?? Number.POSITIVE_INFINITY;
    const bTime = b.invoice.dueDate?.getTime() ?? Number.POSITIVE_INFINITY;
    return aTime - bTime;
  });
  const rows = sorted.slice(0, 200);
  const total = allRows.length;
  const base = { q: query, source, status };

  const statusChips: { key: Status; label: string }[] = [
    { key: "all", label: `All (${total})` },
    { key: "overdue", label: `Overdue (${groups.overdue.length})` },
    { key: "open", label: `Open (${groups.open.length})` },
    { key: "paid", label: `Paid (${groups.paid.length})` },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
        <span className="rounded-full bg-panel px-2.5 py-0.5 text-xs font-semibold text-ink">
          {total} synced
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(
          [
            { key: "overdue", label: "Overdue", dot: "bg-rose-600" },
            { key: "open", label: "Open", dot: "bg-slate-400" },
            { key: "paid", label: "Paid", dot: "bg-emerald-600" },
          ] as const
        ).map((stat) => (
          <div
            key={stat.key}
            className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
          >
            <p className="flex items-center justify-between text-xs font-medium text-slate-500">
              {stat.label}
              <span className={`h-2 w-2 rounded-full ${stat.dot}`} />
            </p>
            <p className="mt-1 text-lg font-bold tabular-nums">{groups[stat.key].length}</p>
            <p className="text-xs text-slate-500">{groupTotal(groups[stat.key])}</p>
          </div>
        ))}
      </div>
      <form method="get" className="flex flex-col gap-2.5">
        <div className="relative w-full">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <Input
            name="q"
            defaultValue={query}
            placeholder="Search by customer name or invoice # (e.g. INV-1042)..."
            className="pl-9"
          />
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          {source !== "all" && <input type="hidden" name="source" value={source} />}
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {statusChips.map((chip) => (
            <Link
              key={chip.key}
              href={chipHref(base, { status: chip.key })}
              className={
                status === chip.key
                  ? "whitespace-nowrap rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
                  : "whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              }
            >
              {chip.label}
            </Link>
          ))}
          <span className="mx-0.5 h-4 w-px shrink-0 bg-slate-200" />
          {(
            [
              { key: "all", label: "All sources" },
              { key: "quickbooks", label: "QuickBooks" },
              { key: "xero", label: "Xero" },
            ] as const
          ).map((chip) => (
            <Link
              key={chip.key}
              href={chipHref(base, { source: chip.key })}
              className={
                source === chip.key
                  ? "whitespace-nowrap rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
                  : "whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              }
            >
              {chip.label}
            </Link>
          ))}
          <Button type="submit" size="sm" className="ml-auto shrink-0">
            Search
          </Button>
        </div>
      </form>
      <div className="flex flex-col gap-3">
        {rows.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-600">
              {query || status !== "all" || source !== "all"
                ? "No invoices match those filters."
                : "No invoices synced yet."}
            </p>
          </Card>
        ) : (
          <>
            {sorted.length > rows.length && (
              <p className="text-sm text-slate-500">
                Showing first {rows.length} of {sorted.length}.
              </p>
            )}
            {rows.map(({ invoice, status: itemStatus }) => {
              const customer = invoice.customerName ?? "Customer";
              const daysOverdue =
                invoice.dueDate && invoice.balance > 0
                  ? Math.floor(
                      (today.getTime() - invoice.dueDate.getTime()) / 86_400_000,
                    )
                  : null;
              return (
                <article
                  key={invoice.id}
                  className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm"
                >
                  <div className={`absolute bottom-0 left-0 top-0 w-1 ${itemStatus.rail}`} />
                  <div className="flex items-start justify-between gap-2 pl-1">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${avatarToneFor(customer)}`}
                      >
                        {initialsFor(customer)}
                      </span>
                      <div>
                        <h2 className="text-sm font-semibold leading-tight text-ink">
                          {customer}
                        </h2>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                          <span className="font-semibold tabular-nums">
                            {invoice.docNumber ?? invoice.sourceId}
                          </span>
                          <span>•</span>
                          <span>{sourceLabels[invoice.source] ?? invoice.source}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold tabular-nums text-ink">
                        {formatMoney(invoice.balance, invoice.currency)}
                      </p>
                      <Pill tone={itemStatus.tone} className="mt-1">
                        {itemStatus.label}
                      </Pill>
                      {itemStatus.key === "disputed" && (
                        <Pill tone="slate" className="ml-1 mt-1">
                          Paused
                        </Pill>
                      )}
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-slate-100 pl-1 pt-2.5">
                    <p className="text-xs text-slate-500">
                      {invoice.dueDate
                        ? `Due: ${invoice.dueDate.toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}${daysOverdue !== null && daysOverdue > 0 ? ` (${daysOverdue} days overdue)` : daysOverdue !== null && daysOverdue < 0 ? ` (due in ${-daysOverdue} days)` : ""}`
                        : "No due date"}
                    </p>
                    {itemStatus.key === "overdue" && (
                      <Link
                        href="/dashboard/queue"
                        className="shrink-0 text-xs font-semibold text-brand hover:underline"
                      >
                        View in Queue →
                      </Link>
                    )}
                    {itemStatus.key === "disputed" && (
                      <Link
                        href="/dashboard/queue?filter=disputed"
                        className="shrink-0 text-xs font-semibold text-brand hover:underline"
                      >
                        View dispute →
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
