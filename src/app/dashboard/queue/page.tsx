import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
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
import { formatMoney } from "@/lib/format";
import { getCurrentOrganization } from "@/lib/organizations";
import { requireBillingAccess } from "@/lib/billing";

export default async function QueuePage() {
  const organization = await getCurrentOrganization();
  if (!organization) {
    redirect("/onboarding");
  }
  await requireBillingAccess(organization);
  const queue = await getCallQueue(organization.id, organization.name);
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
      <Card title="Call queue">
        {queue.length === 0 ? (
          <p className="text-sm text-slate-600">
            {syncStatuses.length > 0
              ? "Nothing overdue right now."
              : "Connect QuickBooks or Xero on the dashboard to build your call queue."}
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-slate-100">
            {queue.map((row) => (
              <li key={row.invoice.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium">
                    {row.invoice.customerName ?? "Customer"}
                    <span className="ml-2 text-sm font-normal text-slate-500">
                      {row.invoice.docNumber ? `Invoice ${row.invoice.docNumber}` : ""}
                    </span>
                  </p>
                  <p className="text-sm text-slate-600">
                    {formatMoney(row.invoice.balance, row.invoice.currency)} · {row.daysOverdue}{" "}
                    {row.daysOverdue === 1 ? "day" : "days"} overdue
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {row.brokenPromise && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                      Broken promise
                    </span>
                  )}
                  {row.promise && !row.brokenPromise && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      Promised {formatMoney(row.promise.amount, row.invoice.currency)} by{" "}
                      {row.promise.promisedDate.toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
                {row.nextReminder ? (
                  <div className="rounded-lg bg-slate-50 p-3">
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
                  <summary className="cursor-pointer text-sm font-medium text-slate-700">
                    Actions
                  </summary>
                  <div className="mt-3 flex flex-col gap-4">
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
            ))}
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
              <li key={event.id} className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
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
