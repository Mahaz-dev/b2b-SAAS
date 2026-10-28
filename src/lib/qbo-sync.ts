import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { getQboConnection, qboQueryAll } from "@/lib/quickbooks";
import { qboConnections, qboCustomers, qboInvoices } from "@/lib/schema";

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
    let customers = 0;
    for (const record of customerRecords) {
      const parsed = qboCustomerSchema.safeParse(record);
      if (!parsed.success) {
        continue;
      }
      const customer = parsed.data;
      await db
        .insert(qboCustomers)
        .values({
          displayName: customer.DisplayName,
          email: customer.PrimaryEmailAddr?.Address ?? null,
          organizationId,
          qboId: customer.Id,
        })
        .onConflictDoUpdate({
          set: {
            displayName: customer.DisplayName,
            email: customer.PrimaryEmailAddr?.Address ?? null,
          },
          target: [qboCustomers.organizationId, qboCustomers.qboId],
        });
      customers += 1;
    }
    const invoiceRecords = await qboQueryAll(
      connection,
      "Invoice",
      "select Id, DocNumber, CustomerRef, TotalAmt, Balance, DueDate, TxnDate, CurrencyRef from Invoice",
    );
    let invoices = 0;
    for (const record of invoiceRecords) {
      const parsed = qboInvoiceSchema.safeParse(record);
      if (!parsed.success) {
        continue;
      }
      const invoice = parsed.data;
      await db
        .insert(qboInvoices)
        .values({
          balance: invoice.Balance,
          currency: invoice.CurrencyRef?.value ?? null,
          customerName: invoice.CustomerRef?.name ?? null,
          docNumber: invoice.DocNumber ?? null,
          dueDate: parseQboDate(invoice.DueDate),
          organizationId,
          qboCustomerId: invoice.CustomerRef?.value ?? null,
          qboId: invoice.Id,
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
            qboCustomerId: invoice.CustomerRef?.value ?? null,
            totalAmount: invoice.TotalAmt,
            txnDate: parseQboDate(invoice.TxnDate),
          },
          target: [qboInvoices.organizationId, qboInvoices.qboId],
        });
      invoices += 1;
    }
    await db
      .update(qboConnections)
      .set({ lastSyncedAt: new Date() })
      .where(eq(qboConnections.organizationId, organizationId));
    return { customers, invoices, status: "ok" };
  } catch {
    return { status: "error" };
  }
}
