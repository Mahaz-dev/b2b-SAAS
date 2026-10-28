import { cx } from "@/lib/cx";

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white shadow-sm">
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path d="M3 21h18" />
          <path d="M5 21V8l7-5 7 5v13" />
          <path d="M9 21v-4h6v4" />
          <path d="M9 11h.01M15 11h.01" />
        </svg>
      </span>
      <span className={cx("text-lg font-bold tracking-tight", dark ? "text-white" : "text-ink")}>
        ChaseUp
      </span>
    </span>
  );
}
