import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type PillProps = {
  tone?: "amber" | "emerald" | "red" | "slate";
  children: ReactNode;
  className?: string;
};

const tones = {
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
  red: "border-rose-200 bg-rose-50 text-rose-800",
  slate: "border-slate-200 bg-slate-100 text-slate-700",
};

export function Pill({ tone = "slate", children, className }: PillProps) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
