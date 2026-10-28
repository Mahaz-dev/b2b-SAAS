import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type PillProps = {
  tone?: "amber" | "blue" | "emerald" | "red" | "slate";
  children: ReactNode;
  className?: string;
};

const tones = {
  amber: "bg-amber-100 text-amber-800",
  blue: "bg-blue-100 text-blue-800",
  emerald: "bg-emerald-100 text-emerald-800",
  red: "bg-red-100 text-red-800",
  slate: "bg-slate-100 text-slate-700",
};

export function Pill({ tone = "slate", children, className }: PillProps) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
