import { describe, expect, it } from "vitest";
import { nextReminderStep, renderReminder, REMINDER_SEQUENCE, type InvoiceRow } from "@/lib/chase";

function invoice(overrides: Partial<InvoiceRow> = {}): InvoiceRow {
  return {
    balance: 250,
    createdAt: new Date("2026-01-01"),
    currency: "USD",
    customerName: "Acme Studio",
    docNumber: "INV-42",
    dueDate: new Date("2026-01-01"),
    id: "inv-1",
    organizationId: "org-1",
    source: "quickbooks",
    sourceCustomerId: "cust-1",
    sourceId: "qbo-1",
    totalAmount: 250,
    txnDate: new Date("2025-12-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

describe("nextReminderStep", () => {
  it("returns the first step once an invoice is a day overdue", () => {
    expect(nextReminderStep(1, 0)?.step).toBe(1);
  });

  it("waits for the next step's day offset", () => {
    expect(nextReminderStep(5, 1)).toBeNull();
    expect(nextReminderStep(7, 1)?.step).toBe(2);
  });

  it("returns null once the whole sequence is sent", () => {
    expect(nextReminderStep(100, 4)).toBeNull();
  });
});

describe("renderReminder", () => {
  it("substitutes every placeholder", () => {
    const rendered = renderReminder(REMINDER_SEQUENCE[0], invoice(), 3, "ChaseUp");
    expect(rendered.subject).toBe("Friendly reminder: invoice INV-42 is overdue");
    expect(rendered.body).toContain("Acme Studio");
    expect(rendered.body).toContain("250.00 USD");
    expect(rendered.body).toContain("3 days ago");
    expect(rendered.body).toContain("ChaseUp");
  });

  it("falls back to the source id when there is no document number", () => {
    const rendered = renderReminder(REMINDER_SEQUENCE[0], invoice({ docNumber: null }), 3, "ChaseUp");
    expect(rendered.subject).toContain("qbo-1");
  });
});
