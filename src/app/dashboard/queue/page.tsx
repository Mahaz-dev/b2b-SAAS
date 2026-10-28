import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import {
  DisputeForm,
  LogCallForm,
  LogReminderForm,
  PromiseForm,
  ResolveDisputeForm,
} from "@/components/queue-forms";
import {
  chaseEventLabel,
  getCallQueue,
  getOpenDisputes,
  getRecentActivity,
  getSyncStatuses,
} from "@/lib/chase";
import { cx } from "@/lib/cx";
import { avatarToneFor, formatMoney, initialsFor } from "@/lib/format";
import { getCurrentOrganization } from "@/lib/organizations";
import { requireBillingAccess } from "@/lib/billing";

export default async function QueuePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const organization = await getCurrentOrganization();
  if (!organization) {
    redirect("/onboarding");
  }
  await requireBillingAccess(organization);
  const params = await searchParams;
  const brokenOnly = params.filter === "broken";
  const allQueue = await getCallQueue(organization.id, organization.name);
  const queue = brokenOnly ? allQueue.filter((row) => row.brokenPromise) : allQueue;
  const brokenCount = allQueue.filter((row) => row.brokenPromise).length;
  const openDisputes = await getOpenDisputes(organization.id);
  const activity = await getRecentActivity(organization.id);
  const syncStatuses = await getSyncStatuses(organization.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Who to call today</h1>
        {syncStatuses.length > 0 && (
          <p className="mt-1 text-sm text-slate-600">
            {syncStatuses
              .map(
                (status) =>
                  `${status.source} last synced ${
                    status.lastSyncedAt
                      ? status.lastSyncedAt.toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "never"
                  }`,
              )
              .join(" · ")}
            .
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/dashboard/queue"
          className={cx(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            !brokenOnly
              ? "bg-slate-950 text-white"
              : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-slate-950",
          )}
        >
          All ({allQueue.length})
        </Link>
        <Link
          href="/dashboard/queue?filter=broken"
          className={cx(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            brokenOnly
              ? "bg-slate-950 text-white"
              : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-slate-950",
          )}
        >
          Broken promises ({brokenCount})
        </Link>
      </div>
      <Card title="Call queue">
        {queue.length === 0 ? (
          <p className="text-sm text-slate-600">
            {brokenOnly
              ? "No broken promises right now."
              : syncStatuses.length > 0
                ? "Nothing overdue right now."
                : "Connect QuickBooks or Xero on the dashboard to build your call queue."}
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-slate-100">
            {queue.map((row) => {
              const customer = row.invoice.customerName ?? "Customer";
              const severity =
                row.daysOverdue >= 30
                  ? "border-red-500"
                  : row.daysOverdue >= 14
                    ? "border-amber-400"
                    : "border-slate-200";
              return (
                <li
                  key={row.invoice.id}
                  className={cx(
                    "flex flex-col gap-3 border-l-4 py-4 pl-4 first:pt-0 last:pb-0",
                    severity,
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="flex items-center gap-3 font-medium">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${avatarToneFor(customer)}`}
                      >
                        {initialsFor(customer)}
                      </span>
                      <span>
                        {customer}
                        <span className="ml-2 text-sm font-normal text-slate-500">
                          {row.invoice.docNumber ? `Invoice ${row.invoice.docNumber}` : ""}
                        </span>
                      </span>
                    </p>
                    <p className="text-sm text-slate-600">
                      <span className="font-semibold text-slate-900">
                        {formatMoney(row.invoice.balance, row.invoice.currency)}
                      </span>{" "}
                      · {row.daysOverdue} {row.daysOverdue === 1 ? "day" : "days"} overdue
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {row.brokenPromise && <Pill tone="red">Broken promise</Pill>}
                    {row.promise && !row.brokenPromise && (
                      <Pill tone="amber">
                        Promised {formatMoney(row.promise.amount, row.invoice.currency)} by{" "}
                        {row.promise.promisedDate.toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </Pill>
                    )}
                    <Pill tone="slate">
                      {row.invoice.source === "xero" ? "Xero" : "QuickBooks"}
                    </Pill>
                  </div>
                  {row.nextReminder ? (
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-sm font-medium">Next reminder: {row.nextReminder.subject}</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                        {row.nextReminder.body}
                      </p>
                      <div className="mt-3">
                        <LogReminderForm invoiceId={row.invoice.id} step={row.nextReminder.step} />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      {row.sequenceComplete
                        ? "Reminder sequence complete."
                        : "No reminder due yet."}
                    </p>
                  )}
                  <details className="mt-1">
                    <summary className="inline-flex cursor-pointer list-none items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                      Actions
                    </summary>
                    <div className="mt-4 flex flex-col gap-4">
                      <LogCallForm invoiceId={row.invoice.id} />
                      {row.promise ? (
                        <p className="text-sm text-slate-600">Promise already recorded.</p>
                      ) : (
                        <PromiseForm invoiceId={row.invoice.id} />
                      )}
                      <DisputeForm invoiceId={row.invoice.id} />
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      {openDisputes.length > 0 && (
        <Card title="Paused for dispute">
          <ul className="flex flex-col gap-4">
            {openDisputes.map(({ dispute, invoice }) => (
              <li key={dispute.id} className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {invoice.customerName ?? "Customer"}
                    <span className="ml-2 text-sm font-normal text-slate-500">
                      {invoice.docNumber ? `Invoice ${invoice.docNumber}` : ""}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{dispute.reason}</p>
                </div>
                <ResolveDisputeForm disputeId={dispute.id} />
              </li>
            ))}
          </ul>
        </Card>
      )}
      {activity.length > 0 && (
        <Card title="Recent activity">
          <ul className="flex flex-col gap-3">
            {activity.map(({ event, invoice }) => (
              <li
                key={event.id}
                className="flex flex-wrap items-baseline justify-between gap-2 text-sm"
              >
                <p>
                  <span className="font-medium">{chaseEventLabel(event.type)}</span>
                  <span className="text-slate-500">
                    {" "}
                    · {invoice.customerName ?? "Customer"}
                    {invoice.docNumber ? ` · Invoice ${invoice.docNumber}` : ""}
                    {event.note ? ` · ${event.note}` : ""}
                  </span>
                </p>
                <span className="text-slate-500">
                  {event.createdAt.toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
