import { and, desc, eq, gt, inArray, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { chaseEvents, disputes, promises, qboInvoices, sentReminders } from "@/lib/schema";

export type InvoiceRow = typeof qboInvoices.$inferSelect;
export type PromiseRow = typeof promises.$inferSelect;
export type DisputeRow = typeof disputes.$inferSelect;

export type ReminderStep = {
  body: string;
  dayOffset: number;
  step: number;
  subject: string;
};

export const REMINDER_SEQUENCE: ReminderStep[] = [
  {
    body: "Hi {customerName},\n\nJust a friendly reminder that invoice {invoiceNumber} for {amount} was due on {dueDate}, {daysOverdue} days ago.\n\nCould you let us know when we can expect payment?\n\nThanks,\n{orgName}",
    dayOffset: 1,
    step: 1,
    subject: "Friendly reminder: invoice {invoiceNumber} is overdue",
  },
  {
    body: "Hi {customerName},\n\nInvoice {invoiceNumber} for {amount} is now {daysOverdue} days overdue. We have not received payment yet.\n\nPlease arrange payment this week, or reply to discuss a payment plan.\n\nThanks,\n{orgName}",
    dayOffset: 7,
    step: 2,
    subject: "Reminder: invoice {invoiceNumber} is {daysOverdue} days overdue",
  },
  {
    body: "Hi {customerName},\n\nThis is a final notice for invoice {invoiceNumber} for {amount}, now {daysOverdue} days overdue.\n\nIf payment is not received within 7 days, the account may be placed on hold and passed to collections.\n\nPlease pay now or contact us immediately.\n\n{orgName}",
    dayOffset: 14,
    step: 3,
    subject: "Final notice: invoice {invoiceNumber}",
  },
  {
    body: "Hi {customerName},\n\nInvoice {invoiceNumber} for {amount} is {daysOverdue} days overdue despite previous reminders.\n\nThe account is now on hold and the balance will be passed to a collections agency unless payment is received within 7 days.\n\n{orgName}",
    dayOffset: 30,
    step: 4,
    subject: "Escalation: invoice {invoiceNumber} is {daysOverdue} days overdue",
  },
];

export type RenderedReminder = {
  body: string;
  step: number;
  subject: string;
};

export function nextReminderStep(daysOverdue: number, maxSentStep: number) {
  return (
    REMINDER_SEQUENCE.find((step) => step.dayOffset <= daysOverdue && step.step > maxSentStep) ??
    null
  );
}

export function renderReminder(
  step: ReminderStep,
  invoice: InvoiceRow,
  daysOverdue: number,
  orgName: string,
): RenderedReminder {
  const values: Record<string, string> = {
    amount: formatMoney(invoice.balance, invoice.currency),
    customerName: invoice.customerName ?? "Customer",
    daysOverdue: String(daysOverdue),
    dueDate: invoice.dueDate
      ? invoice.dueDate.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
      : "unknown",
    invoiceNumber: invoice.docNumber ?? invoice.qboId,
    orgName,
  };
  const render = (template: string) =>
    template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
  return { body: render(step.body), step: step.step, subject: render(step.subject) };
}

export function startOfTodayUtc() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today;
}

export function daysOverdue(invoice: InvoiceRow, today: Date) {
  if (!invoice.dueDate) {
    return null;
  }
  return Math.floor((today.getTime() - invoice.dueDate.getTime()) / 86_400_000);
}

export type QueueRow = {
  brokenPromise: boolean;
  daysOverdue: number;
  invoice: InvoiceRow;
  nextReminder: RenderedReminder | null;
  promise: PromiseRow | null;
  score: number;
  sequenceComplete: boolean;
};

export async function getCallQueue(organizationId: string, orgName: string): Promise<QueueRow[]> {
  const today = startOfTodayUtc();
  const invoices = await db
    .select()
    .from(qboInvoices)
    .where(
      and(
        eq(qboInvoices.organizationId, organizationId),
        gt(qboInvoices.balance, 0),
        lt(qboInvoices.dueDate, today),
      ),
    );
  if (invoices.length === 0) {
    return [];
  }
  const invoiceIds = invoices.map((invoice) => invoice.id);
  const openPromises = await db
    .select()
    .from(promises)
    .where(
      and(
        eq(promises.organizationId, organizationId),
        eq(promises.status, "open"),
        inArray(promises.invoiceId, invoiceIds),
      ),
    );
  const openDisputes = await db
    .select()
    .from(disputes)
    .where(
      and(
        eq(disputes.organizationId, organizationId),
        eq(disputes.status, "open"),
        inArray(disputes.invoiceId, invoiceIds),
      ),
    );
  const sent = await db
    .select()
    .from(sentReminders)
    .where(
      and(
        eq(sentReminders.organizationId, organizationId),
        inArray(sentReminders.invoiceId, invoiceIds),
      ),
    );
  const disputedIds = new Set(openDisputes.map((dispute) => dispute.invoiceId));
  const promiseByInvoice = new Map(openPromises.map((promise) => [promise.invoiceId, promise]));
  const maxStepByInvoice = new Map<string, number>();
  for (const reminder of sent) {
    maxStepByInvoice.set(
      reminder.invoiceId,
      Math.max(maxStepByInvoice.get(reminder.invoiceId) ?? 0, reminder.step),
    );
  }
  const rows: QueueRow[] = [];
  for (const invoice of invoices) {
    if (disputedIds.has(invoice.id)) {
      continue;
    }
    const days = daysOverdue(invoice, today);
    if (days === null) {
      continue;
    }
    const promise = promiseByInvoice.get(invoice.id) ?? null;
    const brokenPromise = promise ? promise.promisedDate < today : false;
    const maxStep = maxStepByInvoice.get(invoice.id) ?? 0;
    const nextStep = nextReminderStep(days, maxStep);
    rows.push({
      brokenPromise,
      daysOverdue: days,
      invoice,
      nextReminder: nextStep ? renderReminder(nextStep, invoice, days, orgName) : null,
      promise,
      score: invoice.balance * days,
      sequenceComplete: maxStep >= REMINDER_SEQUENCE.length,
    });
  }
  rows.sort(
    (a, b) =>
      Number(b.brokenPromise) - Number(a.brokenPromise) ||
      b.score - a.score ||
      (a.invoice.dueDate?.getTime() ?? 0) - (b.invoice.dueDate?.getTime() ?? 0),
  );
  return rows;
}

export type DisputeWithInvoice = {
  dispute: DisputeRow;
  invoice: InvoiceRow;
};

export async function getOpenDisputes(organizationId: string): Promise<DisputeWithInvoice[]> {
  const rows = await db
    .select({ dispute: disputes, invoice: qboInvoices })
    .from(disputes)
    .innerJoin(qboInvoices, eq(disputes.invoiceId, qboInvoices.id))
    .where(and(eq(disputes.organizationId, organizationId), eq(disputes.status, "open")))
    .orderBy(desc(disputes.createdAt));
  return rows;
}

export type ActivityWithInvoice = {
  event: typeof chaseEvents.$inferSelect;
  invoice: InvoiceRow;
};

export async function getRecentActivity(
  organizationId: string,
  limit = 10,
): Promise<ActivityWithInvoice[]> {
  return db
    .select({ event: chaseEvents, invoice: qboInvoices })
    .from(chaseEvents)
    .innerJoin(qboInvoices, eq(chaseEvents.invoiceId, qboInvoices.id))
    .where(eq(chaseEvents.organizationId, organizationId))
    .orderBy(desc(chaseEvents.createdAt))
    .limit(limit);
}

const eventTypeLabels: Record<string, string> = {
  call_logged: "Call logged",
  dispute_opened: "Dispute opened",
  dispute_resolved: "Dispute resolved",
  promise_created: "Promise made",
  promise_kept: "Promise kept",
  reminder_sent: "Reminder sent",
};

export function chaseEventLabel(type: string) {
  return eventTypeLabels[type] ?? type;
}

export async function getOrgInvoice(organizationId: string, invoiceId: string) {
  const rows = await db
    .select()
    .from(qboInvoices)
    .where(
      and(eq(qboInvoices.organizationId, organizationId), eq(qboInvoices.id, invoiceId)),
    )
    .limit(1);
  return rows[0] ?? null;
}
