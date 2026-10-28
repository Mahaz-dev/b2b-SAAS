const rows = [
  {
    amount: "$4,850.00 USD",
    broken: true,
    customer: "Northwind Studio",
    days: "34 days overdue",
    doc: "INV-1042",
    initials: "NS",
    tone: "bg-rose-100 text-rose-800",
  },
  {
    amount: "$2,300.00 USD",
    broken: false,
    customer: "Brightline Media",
    days: "21 days overdue",
    doc: "INV-1038",
    initials: "BM",
    tone: "bg-blue-100 text-blue-800",
  },
  {
    amount: "$1,120.00 USD",
    broken: false,
    customer: "Harbor & Co",
    days: "12 days overdue",
    doc: "INV-1035",
    initials: "HC",
    tone: "bg-amber-100 text-amber-800",
  },
];

export function LandingDashboardMock() {
  return (
    <div className="relative mx-auto mt-14 max-w-4xl">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white text-left shadow-2xl shadow-black/40">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
          <span className="ml-3 hidden rounded-md bg-slate-100 px-3 py-1 text-xs text-slate-500 sm:block">
            app.chaseup.com/dashboard/queue
          </span>
        </div>
        <div className="px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-base font-semibold tracking-tight text-slate-950">
              Who to call today
            </h3>
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-900">$8,270.00</span> overdue
            </p>
          </div>
          <ul className="mt-4 divide-y divide-slate-100">
            {rows.map((row) => (
              <li key={row.doc} className="flex items-center gap-3 py-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${row.tone}`}
                >
                  {row.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-900">
                    {row.customer}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {row.doc} · {row.days}
                  </span>
                </span>
                {row.broken ? (
                  <span className="hidden rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 sm:inline">
                    Promise broken
                  </span>
                ) : null}
                <span className="text-sm font-semibold text-slate-900">{row.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="absolute -right-3 -top-6 hidden animate-float rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl sm:block">
        <p className="text-xs text-slate-500">Promise kept</p>
        <p className="text-sm font-semibold text-emerald-700">+$4,200.00 collected</p>
      </div>
    </div>
  );
}
