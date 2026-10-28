"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import {
  daysOverdue,
  getOrgInvoice,
  nextReminderStep,
  renderReminder,
  startOfTodayUtc,
} from "@/lib/chase";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { getCurrentOrganization } from "@/lib/organizations";
import { chaseEvents, disputes, promises, sentReminders } from "@/lib/schema";
import { requireUser } from "@/lib/session";

export type ChaseState = {
  status: "already_exists" | "error" | "idle" | "ok";
};

async function requireOrgInvoice(invoiceId: string) {
  const user = await requireUser();
  const organization = await getCurrentOrganization();
  if (!organization) {
    redirect("/onboarding");
  }
  const invoice = await getOrgInvoice(organization.id, invoiceId);
  return { invoice, organization, user };
}

const logCallSchema = z.object({
  invoiceId: z.string().min(1),
  note: z.string().trim().min(1).max(2000),
});

export async function logCallAction(_previous: ChaseState, formData: FormData): Promise<ChaseState> {
  const parsed = logCallSchema.safeParse({
    invoiceId: formData.get("invoiceId"),
    note: formData.get("note"),
  });
  if (!parsed.success) {
    return { status: "error" };
  }
  const { invoice, organization, user } = await requireOrgInvoice(parsed.data.invoiceId);
  if (!invoice) {
    return { status: "error" };
  }
  await db.insert(chaseEvents).values({
    createdBy: user.id,
    invoiceId: invoice.id,
    note: parsed.data.note,
    organizationId: organization.id,
    type: "call_logged",
  });
  revalidatePath("/dashboard/queue");
  return { status: "ok" };
}

const promiseSchema = z.object({
  amount: z.coerce.number().positive(),
  invoiceId: z.string().min(1),
  note: z.string().trim().max(2000).optional(),
  promisedDate: z.string().min(1),
});

export async function recordPromiseAction(
  _previous: ChaseState,
  formData: FormData,
): Promise<ChaseState> {
  const parsed = promiseSchema.safeParse({
    amount: formData.get("amount"),
    invoiceId: formData.get("invoiceId"),
    note: formData.get("note") || undefined,
    promisedDate: formData.get("promisedDate"),
  });
  if (!parsed.success) {
    return { status: "error" };
  }
  const promisedDate = new Date(parsed.data.promisedDate);
  if (Number.isNaN(promisedDate.getTime())) {
    return { status: "error" };
  }
  const { invoice, organization, user } = await requireOrgInvoice(parsed.data.invoiceId);
  if (!invoice || invoice.balance <= 0) {
    return { status: "error" };
  }
  const existing = await db
    .select({ id: promises.id })
    .from(promises)
    .where(
      and(
        eq(promises.organizationId, organization.id),
        eq(promises.invoiceId, invoice.id),
        eq(promises.status, "open"),
      ),
    )
    .limit(1);
  if (existing.length > 0) {
    return { status: "already_exists" };
  }
  await db.insert(promises).values({
    amount: parsed.data.amount,
    createdBy: user.id,
    invoiceId: invoice.id,
    note: parsed.data.note ?? null,
    organizationId: organization.id,
    promisedDate,
  });
  await db.insert(chaseEvents).values({
    createdBy: user.id,
    invoiceId: invoice.id,
    note: `Promised ${formatMoney(parsed.data.amount, invoice.currency)} by ${promisedDate.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}`,
    organizationId: organization.id,
    type: "promise_created",
  });
  revalidatePath("/dashboard/queue");
  return { status: "ok" };
}

const disputeSchema = z.object({
  invoiceId: z.string().min(1),
  reason: z.string().trim().min(1).max(2000),
});

export async function openDisputeAction(
  _previous: ChaseState,
  formData: FormData,
): Promise<ChaseState> {
  const parsed = disputeSchema.safeParse({
    invoiceId: formData.get("invoiceId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { status: "error" };
  }
  const { invoice, organization, user } = await requireOrgInvoice(parsed.data.invoiceId);
  if (!invoice) {
    return { status: "error" };
  }
  const existing = await db
    .select({ id: disputes.id })
    .from(disputes)
    .where(
      and(
        eq(disputes.organizationId, organization.id),
        eq(disputes.invoiceId, invoice.id),
        eq(disputes.status, "open"),
      ),
    )
    .limit(1);
  if (existing.length > 0) {
    return { status: "already_exists" };
  }
  await db.insert(disputes).values({
    invoiceId: invoice.id,
    openedBy: user.id,
    organizationId: organization.id,
    reason: parsed.data.reason,
  });
  await db.insert(chaseEvents).values({
    createdBy: user.id,
    invoiceId: invoice.id,
    note: parsed.data.reason,
    organizationId: organization.id,
    type: "dispute_opened",
  });
  revalidatePath("/dashboard/queue");
  return { status: "ok" };
}

const resolveDisputeSchema = z.object({
  disputeId: z.string().min(1),
});

export async function resolveDisputeAction(
  _previous: ChaseState,
  formData: FormData,
): Promise<ChaseState> {
  const parsed = resolveDisputeSchema.safeParse({ disputeId: formData.get("disputeId") });
  if (!parsed.success) {
    return { status: "error" };
  }
  const user = await requireUser();
  const organization = await getCurrentOrganization();
  if (!organization) {
    redirect("/onboarding");
  }
  const rows = await db
    .select()
    .from(disputes)
    .where(
      and(
        eq(disputes.organizationId, organization.id),
        eq(disputes.id, parsed.data.disputeId),
        eq(disputes.status, "open"),
      ),
    )
    .limit(1);
  const dispute = rows[0];
  if (!dispute) {
    return { status: "error" };
  }
  await db
    .update(disputes)
    .set({ resolvedAt: new Date(), status: "resolved" })
    .where(eq(disputes.id, dispute.id));
  await db.insert(chaseEvents).values({
    createdBy: user.id,
    invoiceId: dispute.invoiceId,
    organizationId: organization.id,
    type: "dispute_resolved",
  });
  revalidatePath("/dashboard/queue");
  return { status: "ok" };
}

const reminderSchema = z.object({
  invoiceId: z.string().min(1),
  step: z.coerce.number().int(),
});

export async function logReminderSentAction(
  _previous: ChaseState,
  formData: FormData,
): Promise<ChaseState> {
  const parsed = reminderSchema.safeParse({
    invoiceId: formData.get("invoiceId"),
    step: formData.get("step"),
  });
  if (!parsed.success) {
    return { status: "error" };
  }
  const { invoice, organization, user } = await requireOrgInvoice(parsed.data.invoiceId);
  if (!invoice || invoice.balance <= 0) {
    return { status: "error" };
  }
  const days = daysOverdue(invoice, startOfTodayUtc());
  if (days === null) {
    return { status: "error" };
  }
  const sent = await db
    .select({ step: sentReminders.step })
    .from(sentReminders)
    .where(
      and(
        eq(sentReminders.organizationId, organization.id),
        eq(sentReminders.invoiceId, invoice.id),
      ),
    );
  const maxStep = sent.reduce((max, row) => Math.max(max, row.step), 0);
  const expected = nextReminderStep(days, maxStep);
  if (!expected || expected.step !== parsed.data.step) {
    return { status: "error" };
  }
  const rendered = renderReminder(expected, invoice, days, organization.name);
  await db.insert(sentReminders).values({
    invoiceId: invoice.id,
    organizationId: organization.id,
    sentBy: user.id,
    step: expected.step,
  });
  await db.insert(chaseEvents).values({
    createdBy: user.id,
    invoiceId: invoice.id,
    note: rendered.subject,
    organizationId: organization.id,
    type: "reminder_sent",
  });
  revalidatePath("/dashboard/queue");
  return { status: "ok" };
}
