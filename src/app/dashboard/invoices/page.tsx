import { and, asc, eq, ilike, or, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { getCurrentOrganization } from "@/lib/organizations";
import { invoices } from "@/lib/schema";
import { requireBillingAccess } from "@/lib/billing";

const sourceLabels: Record<string, string> = {
  quickbooks: "QuickBooks",
  xero: "Xero",
};

function invoiceStatus(balance: number, dueDate: Date | null, today: Date) {
  if (balance <= 0) {
    return { label: "Paid", tone: "bg-green-100 text-green-800" };
  }
  if (dueDate && dueDate < today) {
    return { label: "Overdue", tone: "bg-red-100 text-red-800" };
  }
  return { label: "Open", tone: "bg-slate-100 text-slate-800" };
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
      <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
      <form method="get" className="flex gap-2">
        <Input name="q" defaultValue={query} placeholder="Search customer or invoice number" />
        <Button type="submit">Search</Button>
      </form>
      <Card title={`${total} ${total === 1 ? "invoice" : "invoices"}`}>
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
                return (
                  <li
                    key={invoice.id}
                    className="flex flex-wrap items-baseline justify-between gap-2 py-3 first:pt-0 last:pb-0"
                  >
                    <p className="font-medium">
                      {invoice.customerName ?? "Customer"}
                      <span className="ml-2 text-sm font-normal text-slate-500">
                        {invoice.docNumber ? `Invoice ${invoice.docNumber}` : ""}
                        {` · ${sourceLabels[invoice.source] ?? invoice.source}`}
                      </span>
                    </p>
                    <p className="flex items-center gap-3 text-sm">
                      <span className="text-slate-600">
                        {formatMoney(invoice.balance, invoice.currency)} due
                        {invoice.dueDate
                          ? ` · ${invoice.dueDate.toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}`
                          : ""}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.tone}`}
                      >
                        {status.label}
                      </span>
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
