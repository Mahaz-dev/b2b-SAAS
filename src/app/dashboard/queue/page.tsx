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

type Filter = "all" | "broken" | "disputed" | "overdue30";

const filters: { key: Filter; label: (counts: { all: number; broken: number; disputed: number; overdue30: number }) => string }[] = [
  { key: "all", label: (c) => `All (${c.all})` },
  { key: "broken", label: (c) => `Broken promises (${c.broken})` },
  { key: "overdue30", label: (c) => `30+ Days (${c.overdue30})` },
  { key: "disputed", label: (c) => `Disputed (${c.disputed})` },
];

function eventDot(type: string) {
  if (type.includes("dispute")) return "bg-rose-600";
  if (type.includes("promise_kept")) return "bg-emerald-600";
  if (type.includes("promise")) return "bg-amber-500";
  if (type.includes("call")) return "bg-emerald-600";
  return "bg-slate-400";
}

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
  const filter: Filter =
    params.filter === "broken" ||
    params.filter === "overdue30" ||
    params.filter === "disputed"
      ? params.filter
      : "all";
  const allQueue = await getCallQueue(organization.id, organization.name);
  const openDisputes = await getOpenDisputes(organization.id);
  const activity = await getRecentActivity(organization.id);
  const syncStatuses = await getSyncStatuses(organization.id);
  const counts = {
    all: allQueue.length,
    broken: allQueue.filter((row) => row.brokenPromise).length,
    disputed: openDisputes.length,
    overdue30: allQueue.filter((row) => row.daysOverdue >= 30).length,
  };
  const queue =
    filter === "broken"
      ? allQueue.filter((row) => row.brokenPromise)
      : filter === "overdue30"
        ? allQueue.filter((row) => row.daysOverdue >= 30)
        : allQueue;
  const latestSync = syncStatuses
    .map((status) => status.lastSyncedAt)
    .filter((date): date is Date => date !== null)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return (
    <div className="flex flex-col gap-4">
      {syncStatuses.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm">
          <p className="flex items-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-600" />
            <span className="font-medium text-ink">
              Synced{" "}
              {latestSync
                ? latestSync.toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "never"}
            </span>
            <span>• {syncStatuses.map((status) => status.source).join(" & ")}</span>
          </p>
          <Link href="/dashboard" className="font-semibold text-brand hover:underline">
            Manage connections
          </Link>
        </div>
      )}
      <div>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Who to call today</h1>
          {counts.broken > 0 && (
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800">
              {counts.broken} Urgent
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Prioritized by broken promises and overdue severity
        </p>
      </div>
      {counts.broken > 0 && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5">
          <span className="text-lg leading-none text-rose-700">⚠</span>
          <div>
            <p className="text-sm font-semibold text-rose-900">
              {counts.broken} {counts.broken === 1 ? "promise broken" : "promises broken"}
            </p>
            <p className="mt-0.5 text-xs text-rose-800">
              These go first in your queue — call them before anything else.
            </p>
          </div>
        </div>
      )}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {filters.map((item) => {
          const active = filter === item.key;
          const href =
            item.key === "all" ? "/dashboard/queue" : `/dashboard/queue?filter=${item.key}`;
          return (
            <Link
              key={item.key}
              href={href}
              className={cx(
                "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                active
                  ? "bg-brand text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                item.key === "broken" && !active && "text-rose-700",
              )}
            >
              {item.label(counts)}
            </Link>
          );
        })}
      </div>

      {filter !== "disputed" && (
        <div className="flex flex-col gap-3.5">
          {queue.length === 0 ? (
            <Card>
              <p className="text-sm text-slate-600">
                {filter === "broken"
                  ? "No broken promises right now."
                  : filter === "overdue30"
                    ? "No invoices over 30 days overdue right now."
                    : syncStatuses.length > 0
                      ? "Nothing overdue right now."
                      : "Connect QuickBooks or Xero on the dashboard to build your call queue."}
              </p>
            </Card>
          ) : (
            queue.map((row) => {
              const customer = row.invoice.customerName ?? "Customer";
              const rail =
                row.daysOverdue >= 30
                  ? "border-l-rose-600"
                  : row.daysOverdue >= 14
                    ? "border-l-amber-500"
                    : "border-l-slate-300";
              return (
                <article
                  key={row.invoice.id}
                  className={cx(
                    "relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm border-l-4",
                    rail,
                  )}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1 ${avatarToneFor(customer)}`}
                        >
                          {initialsFor(customer)}
                        </span>
                        <div>
                          <h2 className="text-sm font-semibold leading-tight text-ink">
                            {customer}
                          </h2>
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                            <span className="font-semibold tabular-nums">
                              {row.invoice.docNumber ?? row.invoice.sourceId}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <span
                                className={cx(
                                  "h-1.5 w-1.5 rounded-full",
                                  row.invoice.source === "xero" ? "bg-sky-500" : "bg-emerald-600",
                                )}
                              />
                              {row.invoice.source === "xero" ? "Xero" : "QuickBooks"}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold tabular-nums tracking-tight text-ink">
                          {formatMoney(row.invoice.balance, row.invoice.currency)}
                        </p>
                        <p
                          className={cx(
                            "text-xs font-semibold",
                            row.daysOverdue >= 30
                              ? "text-rose-700"
                              : row.daysOverdue >= 14
                                ? "text-amber-800"
                                : "text-slate-500",
                          )}
                        >
                          {row.daysOverdue}d Overdue
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {row.brokenPromise && (
                        <Pill tone="red">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                          Broken Promise
                        </Pill>
                      )}
                      {row.promise && !row.brokenPromise && (
                        <Pill tone="amber">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          Promised for{" "}
                          {row.promise.promisedDate.toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "long",
                          })}
                        </Pill>
                      )}
                      <Pill tone="slate">{row.daysOverdue}d Overdue</Pill>
                      {row.promise?.promisedDate ? (
                        <span className="ml-auto text-xs text-slate-500">
                          Promised{" "}
                          {row.promise.promisedDate.toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      ) : null}
                    </div>
                    {row.nextReminder ? (
                      <div className="rounded-lg border border-slate-200 bg-panel p-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-ink">
                            Draft: {row.nextReminder.subject}
                          </p>
                          <LogReminderForm
                            invoiceId={row.invoice.id}
                            step={row.nextReminder.step}
                          />
                        </div>
                        <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-slate-600">
                          {row.nextReminder.body}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">
                        {row.sequenceComplete
                          ? "Reminder sequence complete."
                          : "No reminder due yet."}
                      </p>
                    )}
                    <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
                      <details className="group">
                        <summary className="flex cursor-pointer list-none items-center justify-center rounded-lg bg-pine px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 [&::-webkit-details-marker]:hidden">
                          Log Call
                        </summary>
                        <div className="mt-3">
                          <LogCallForm invoiceId={row.invoice.id} />
                        </div>
                      </details>
                      {row.promise ? (
                        <p className="text-sm text-slate-600">Promise already recorded.</p>
                      ) : (
                        <details className="group">
                          <summary className="flex cursor-pointer list-none items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 [&::-webkit-details-marker]:hidden">
                            Record Promise
                          </summary>
                          <div className="mt-3">
                            <PromiseForm invoiceId={row.invoice.id} />
                          </div>
                        </details>
                      )}
                      <details className="group">
                        <summary className="flex cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                          Open Dispute
                        </summary>
                        <div className="mt-3">
                          <DisputeForm invoiceId={row.invoice.id} />
                        </div>
                      </details>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}

      {(filter === "all" || filter === "disputed") && openDisputes.length > 0 && (
        <details open className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between p-3.5 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
            <span className="font-semibold tracking-tight">
              Paused for dispute ({openDisputes.length})
            </span>
            <span className="text-slate-400 transition-transform group-open:rotate-180">⌄</span>
          </summary>
          <div className="space-y-2.5 border-t border-slate-100 p-3.5">
            {openDisputes.map(({ dispute, invoice }) => (
              <div
                key={dispute.id}
                className="rounded-lg border border-slate-200 bg-panel p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {invoice.customerName ?? "Customer"}
                    </p>
                    <p className="text-xs tabular-nums text-slate-500">
                      {invoice.docNumber ?? invoice.sourceId}
                    </p>
                  </div>
                  <p className="text-sm font-bold tabular-nums text-ink">
                    {formatMoney(invoice.balance, invoice.currency)}
                  </p>
                </div>
                <p className="mt-1.5 rounded bg-amber-50 px-2 py-1 text-xs text-amber-800">
                  Reason: {dispute.reason}
                </p>
                <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 text-xs text-slate-500">
                  <span>
                    Paused{" "}
                    {dispute.createdAt.toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <ResolveDisputeForm disputeId={dispute.id} />
                </div>
              </div>
            ))}
          </div>
        </details>
      )}

      {filter === "all" && activity.length > 0 && (
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold tracking-tight">Recent activity</h2>
          </div>
          <div className="relative ml-1.5 space-y-3 border-l border-slate-200 pl-3.5">
            {activity.map(({ event, invoice }) => (
              <div key={event.id} className="relative">
                <span
                  className={cx(
                    "absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white",
                    eventDot(event.type),
                  )}
                />
                <p className="text-xs font-medium text-ink">
                  {chaseEventLabel(event.type)} · {invoice.customerName ?? "Customer"}
                  {invoice.docNumber ? ` · Invoice ${invoice.docNumber}` : ""}
                </p>
                {event.note ? (
                  <p className="text-[11px] text-slate-500">Note: {event.note}</p>
                ) : null}
                <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                  {event.createdAt.toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
