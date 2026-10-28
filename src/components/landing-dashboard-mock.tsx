export function LandingDashboardMock() {
  return (
    <div className="relative mx-auto mt-12 max-w-3xl">
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white text-left shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-600" />
            Today&apos;s Priority Queue
          </p>
          <span className="rounded bg-panel px-2 py-0.5 text-xs font-semibold tabular-nums text-brand">
            1 of 4 pending
          </span>
        </div>
        <div className="relative m-4 overflow-hidden rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="absolute bottom-0 left-0 top-0 w-1 bg-rose-600" />
          <div className="pl-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-panel text-xs font-bold text-ink">
                  NW
                </span>
                <div>
                  <p className="text-sm font-semibold leading-tight text-ink">Northwind Studio</p>
                  <p className="text-xs text-slate-500">INV-1042 · Design SOW</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold tabular-nums text-ink">$4,850.00</p>
                <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[11px] font-semibold text-rose-700">
                  34d overdue
                </span>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-800">
                Broken Promise
              </span>
              <span className="text-xs text-slate-500">Promised: Oct 14 via Phone</span>
            </div>
            <div className="mt-3 rounded-lg border border-slate-200 bg-panel p-2.5">
              <p className="flex items-center justify-between text-xs font-semibold text-ink">
                Escalation Draft #3 Ready
                <span className="text-[10px] font-medium text-slate-500">Tone: Firm</span>
              </p>
              <p className="mt-1 line-clamp-2 text-xs italic leading-relaxed text-slate-600">
                &ldquo;Hi Sarah, following up on our call where Oct 14 was agreed. We haven&apos;t
                received settlement...&rdquo;
              </p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <span className="flex items-center justify-center rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white">
                Log as sent
              </span>
              <span className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-ink">
                Log Call
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -right-3 -top-6 hidden animate-float rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl sm:block">
        <p className="text-xs text-slate-500">Promise kept</p>
        <p className="text-sm font-semibold text-emerald-700">+$4,200.00 collected</p>
      </div>
    </div>
  );
}
