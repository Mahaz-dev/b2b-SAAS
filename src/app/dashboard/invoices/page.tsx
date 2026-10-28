import { and, asc, eq, ilike, or, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pill } from "@/components/ui/pill";
import { db } from "@/lib/db";
import { avatarToneFor, formatMoney, initialsFor } from "@/lib/format";
import { getCurrentOrganization } from "@/lib/organizations";
import { invoices } from "@/lib/schema";
import { requireBillingAccess } from "@/lib/billing";

const sourceLabels: Record<string, string> = {
  quickbooks: "QuickBooks",
  xero: "Xero",
};

function invoiceStatus(balance: number, dueDate: Date | null, today: Date) {
  if (balance <= 0) {
    return { label: "Paid", tone: "emerald" as const };
  }
  if (dueDate && dueDate < today) {
    return { label: "Overdue", tone: "red" as const };
  }
  return { label: "Open", tone: "slate" as const };
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const organization = await getCurrentOrganization();
  if (!organization) {
    redirect("/onboarding");
  }
  await requireBillingAccess(organization);
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const where = query
    ? and(
        eq(invoices.organizationId, organization.id),
        or(
          ilike(invoices.customerName, `%${query}%`),
          ilike(invoices.docNumber, `%${query}%`),
        ),
      )
    : eq(invoices.organizationId, organization.id);
  const rows = await db
    .select()
    .from(invoices)
    .where(where)
    .orderBy(asc(invoices.dueDate))
    .limit(200);
  const totalRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(invoices)
    .where(eq(invoices.organizationId, organization.id));
  const total = Number(totalRows[0]?.count ?? 0);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
        <p className="mt-1 text-sm text-slate-600">
          {total} {total === 1 ? "invoice" : "invoices"} synced from your accounting.
        </p>
      </div>
      <form method="get" className="flex max-w-xl gap-2">
        <Input name="q" defaultValue={query} placeholder="Search customer or invoice number" />
        <Button type="submit">Search</Button>
      </form>
      <Card>
        {rows.length === 0 ? (
          <p className="text-sm text-slate-600">
            {query ? "No invoices match that search." : "No invoices synced yet."}
          </p>
        ) : (
          <>
            {total > rows.length && (
              <p className="mb-3 text-sm text-slate-500">
                Showing first {rows.length} of {total}.
              </p>
            )}
            <ul className="flex flex-col divide-y divide-slate-100">
              {rows.map((invoice) => {
                const status = invoiceStatus(invoice.balance, invoice.dueDate, today);
                const customer = invoice.customerName ?? "Customer";
                return (
                  <li
                    key={invoice.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <p className="flex items-center gap-3 font-medium">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${avatarToneFor(customer)}`}
                      >
                        {initialsFor(customer)}
                      </span>
                      <span>
                        {customer}
                        <span className="ml-2 text-sm font-normal text-slate-500">
                          {invoice.docNumber ? `Invoice ${invoice.docNumber}` : ""}
                          {` · ${sourceLabels[invoice.source] ?? invoice.source}`}
                        </span>
                      </span>
                    </p>
                    <p className="flex items-center gap-3 text-sm">
                      <span className="text-slate-600">
                        <span className="font-semibold text-slate-900">
                          {formatMoney(invoice.balance, invoice.currency)}
                        </span>
                        {" due"}
                        {invoice.dueDate
                          ? ` · ${invoice.dueDate.toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}`
                          : ""}
                      </span>
                      <Pill tone={status.tone}>{status.label}</Pill>
                    </p>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
}
