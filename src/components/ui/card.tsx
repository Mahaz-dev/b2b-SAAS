import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function Card({ title, children, className }: CardProps) {
  return (
    <section
      className={cx(
        "rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.05)]",
        className,
      )}
    >
      {title ? <h2 className="mb-3 font-semibold tracking-tight">{title}</h2> : null}
      {children}
    </section>
  );
}
