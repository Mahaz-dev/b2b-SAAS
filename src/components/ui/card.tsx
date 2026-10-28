import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function Card({ title, children, className }: CardProps) {
  return (
    <section className={cx("rounded-xl border border-slate-200 bg-white p-5", className)}>
      {title ? <h2 className="mb-2 font-semibold">{title}</h2> : null}
      {children}
    </section>
  );
}
