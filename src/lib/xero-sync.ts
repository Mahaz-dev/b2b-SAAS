import { eq } from "drizzle-orm";
import { z } from "zod";
import { markKeptPromises } from "@/lib/chase";
import { db } from "@/lib/db";
import { customers, invoices, xeroConnections } from "@/lib/schema";
import { getXeroConnection, parseXeroDate, xeroGetPages } from "@/lib/xero";

const xeroContactSchema = z.object({
  ContactID: z.string(),
  EmailAddress: z.string().nullish(),
  Name: z.string(),
});

const xeroInvoiceSchema = z.object({
  AmountDue: z.number(),
  Contact: z
    .object({
      ContactID: z.string().nullish(),
      EmailAddress: z.string().nullish(),
      Name: z.string().nullish(),
    })
    .nullish(),
  CurrencyCode: z.string().nullish(),
  DateString: z.string().nullish(),
  DueDateString: z.string().nullish(),
  InvoiceID: z.string(),
  InvoiceNumber: z.string().nullish(),
  Status: z.string(),
  Total: z.number(),
  Type: z.string(),
});

export type XeroSyncResult =
  | { customers: number; invoices: number; status: "ok" }
  | { status: "error" | "no_connection" };

export async function syncXero(organizationId: string): Promise<XeroSyncResult> {
  try {
    const connection = await getXeroConnection(organizationId);
    if (!connection) {
      return { status: "no_connection" };
    }
    const contactRecords = await xeroGetPages(connection, "/Contacts", "Contacts");
    let contactCount = 0;
    for (const record of contactRecords) {
      const parsed = xeroContactSchema.safeParse(record);
      if (!parsed.success) {
        continue;
      }
      const contact = parsed.data;
      await db
        .insert(customers)
        .values({
          displayName: contact.Name,
          email: contact.EmailAddress ?? null,
          organizationId,
          source: "xero",
          sourceId: contact.ContactID,
        })
        .onConflictDoUpdate({
          set: {
            displayName: contact.Name,
            email: contact.EmailAddress ?? null,
          },
          target: [customers.organizationId, customers.source, customers.sourceId],
        });
      contactCount += 1;
    }
    const invoiceRecords = await xeroGetPages(
      connection,
      "/Invoices?where=Type%3D%3D%22ACCREC%22",
      "Invoices",
    );
    let invoiceCount = 0;
    for (const record of invoiceRecords) {
      const parsed = xeroInvoiceSchema.safeParse(record);
      if (!parsed.success) {
        continue;
      }
      const invoice = parsed.data;
      if (invoice.Type !== "ACCREC" || invoice.Status === "VOIDED" || invoice.Status === "DELETED") {
        continue;
      }
      await db
        .insert(invoices)
        .values({
          balance: invoice.AmountDue,
          currency: invoice.CurrencyCode ?? null,
          customerName: invoice.Contact?.Name ?? null,
          docNumber: invoice.InvoiceNumber ?? null,
          dueDate: parseXeroDate(invoice.DueDateString),
          organizationId,
          source: "xero",
          sourceCustomerId: invoice.Contact?.ContactID ?? null,
          sourceId: invoice.InvoiceID,
          totalAmount: invoice.Total,
          txnDate: parseXeroDate(invoice.DateString),
        })
        .onConflictDoUpdate({
          set: {
            balance: invoice.AmountDue,
            currency: invoice.CurrencyCode ?? null,
            customerName: invoice.Contact?.Name ?? null,
            docNumber: invoice.InvoiceNumber ?? null,
            dueDate: parseXeroDate(invoice.DueDateString),
            sourceCustomerId: invoice.Contact?.ContactID ?? null,
            totalAmount: invoice.Total,
            txnDate: parseXeroDate(invoice.DateString),
          },
          target: [invoices.organizationId, invoices.source, invoices.sourceId],
        });
      invoiceCount += 1;
    }
    await markKeptPromises(organizationId);
    await db
      .update(xeroConnections)
      .set({ lastSyncedAt: new Date() })
      .where(eq(xeroConnections.organizationId, organizationId));
    return { customers: contactCount, invoices: invoiceCount, status: "ok" };
  } catch {
    return { status: "error" };
  }
}
