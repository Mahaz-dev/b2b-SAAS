import { describe, expect, it } from "vitest";
import { daysOverdue, startOfTodayUtc, type InvoiceRow } from "@/lib/chase";

function invoice(dueDate: Date | null): InvoiceRow {
  return {
    balance: 100,
    createdAt: new Date("2026-01-01"),
    currency: null,
    customerName: null,
    docNumber: null,
    dueDate,
    id: "inv-1",
    organizationId: "org-1",
    source: "quickbooks",
    sourceCustomerId: null,
    sourceId: "qbo-1",
    totalAmount: 100,
    txnDate: null,
    updatedAt: new Date("2026-01-01"),
  };
}

describe("daysOverdue", () => {
  it("counts whole days past the due date", () => {
    const today = new Date("2026-01-11T00:00:00.000Z");
    expect(daysOverdue(invoice(new Date("2026-01-01T00:00:00.000Z")), today)).toBe(10);
  });

  it("returns zero on the due date itself", () => {
    const today = new Date("2026-01-01T00:00:00.000Z");
    expect(daysOverdue(invoice(new Date("2026-01-01T00:00:00.000Z")), today)).toBe(0);
  });

  it("returns null without a due date", () => {
    expect(daysOverdue(invoice(null), new Date())).toBeNull();
  });
});

describe("startOfTodayUtc", () => {
  it("zeroes the time component", () => {
    const today = startOfTodayUtc();
    expect(today.getUTCHours()).toBe(0);
    expect(today.getUTCMinutes()).toBe(0);
    expect(today.getUTCSeconds()).toBe(0);
  });
});
