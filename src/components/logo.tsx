import { cx } from "@/lib/cx";

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
        <svg
          className="h-4.5 w-4.5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path d="M7 17 17 7" />
          <path d="M8 7h9v9" />
        </svg>
      </span>
      <span
        className={cx("text-lg font-bold tracking-tight", dark ? "text-white" : "text-slate-950")}
      >
        ChaseUp
      </span>
    </span>
  );
}
