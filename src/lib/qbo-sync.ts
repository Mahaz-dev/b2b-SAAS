import { eq } from "drizzle-orm";
import { z } from "zod";
import { markKeptPromises } from "@/lib/chase";
import { db } from "@/lib/db";
import { getQboConnection, qboQueryAll } from "@/lib/quickbooks";
import { customers, invoices, qboConnections } from "@/lib/schema";

const qboCustomerSchema = z.object({
  DisplayName: z.string(),
  Id: z.string(),
  PrimaryEmailAddr: z.object({ Address: z.string() }).nullish(),
});

const qboInvoiceSchema = z.object({
  Balance: z.number(),
  CurrencyRef: z.object({ value: z.string() }).nullish(),
  CustomerRef: z.object({ name: z.string().nullish(), value: z.string() }).nullish(),
  DocNumber: z.string().nullish(),
  DueDate: z.string().nullish(),
  Id: z.string(),
  TotalAmt: z.number(),
  TxnDate: z.string().nullish(),
});

function parseQboDate(value: string | null | undefined) {
  return value ? new Date(value) : null;
}

export type QuickBooksSyncResult =
  | { customers: number; invoices: number; status: "ok" }
  | { status: "error" | "no_connection" };

export async function syncQuickBooks(organizationId: string): Promise<QuickBooksSyncResult> {
  try {
    const connection = await getQboConnection(organizationId);
    if (!connection) {
      return { status: "no_connection" };
    }
    const customerRecords = await qboQueryAll(
      connection,
      "Customer",
      "select Id, DisplayName, PrimaryEmailAddr from Customer",
    );
    let syncedCustomers = 0;
    for (const record of customerRecords) {
      const parsed = qboCustomerSchema.safeParse(record);
      if (!parsed.success) {
        continue;
      }
      const customer = parsed.data;
      await db
        .insert(customers)
        .values({
          displayName: customer.DisplayName,
          email: customer.PrimaryEmailAddr?.Address ?? null,
          organizationId,
          source: "quickbooks",
          sourceId: customer.Id,
        })
        .onConflictDoUpdate({
          set: {
            displayName: customer.DisplayName,
            email: customer.PrimaryEmailAddr?.Address ?? null,
          },
          target: [customers.organizationId, customers.source, customers.sourceId],
        });
      syncedCustomers += 1;
    }
    const invoiceRecords = await qboQueryAll(
      connection,
      "Invoice",
      "select Id, DocNumber, CustomerRef, TotalAmt, Balance, DueDate, TxnDate, CurrencyRef from Invoice",
    );
    let syncedInvoices = 0;
    for (const record of invoiceRecords) {
      const parsed = qboInvoiceSchema.safeParse(record);
      if (!parsed.success) {
        continue;
      }
      const invoice = parsed.data;
      await db
        .insert(invoices)
        .values({
          balance: invoice.Balance,
          currency: invoice.CurrencyRef?.value ?? null,
          customerName: invoice.CustomerRef?.name ?? null,
          docNumber: invoice.DocNumber ?? null,
          dueDate: parseQboDate(invoice.DueDate),
          organizationId,
          source: "quickbooks",
          sourceCustomerId: invoice.CustomerRef?.value ?? null,
          sourceId: invoice.Id,
          totalAmount: invoice.TotalAmt,
          txnDate: parseQboDate(invoice.TxnDate),
        })
        .onConflictDoUpdate({
          set: {
            balance: invoice.Balance,
            currency: invoice.CurrencyRef?.value ?? null,
            customerName: invoice.CustomerRef?.name ?? null,
            docNumber: invoice.DocNumber ?? null,
            dueDate: parseQboDate(invoice.DueDate),
            sourceCustomerId: invoice.CustomerRef?.value ?? null,
            totalAmount: invoice.TotalAmt,
            txnDate: parseQboDate(invoice.TxnDate),
          },
          target: [invoices.organizationId, invoices.source, invoices.sourceId],
        });
      syncedInvoices += 1;
    }
    await markKeptPromises(organizationId);
    await db
      .update(qboConnections)
      .set({ lastSyncedAt: new Date() })
      .where(eq(qboConnections.organizationId, organizationId));
    return { customers: syncedCustomers, invoices: syncedInvoices, status: "ok" };
  } catch {
    return { status: "error" };
  }
}
