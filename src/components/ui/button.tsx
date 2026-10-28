import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "md" | "sm";
  variant?: "ghost" | "outline" | "primary" | "secondary";
  children: ReactNode;
};

export function Button({
  size = "md",
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center rounded-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40 disabled:cursor-not-allowed disabled:opacity-50",
        size === "md" && "px-4 py-2.5 text-sm",
        size === "sm" && "px-3 py-1.5 text-xs",
        variant === "primary" &&
          "bg-brand text-white shadow-[0_1px_2px_rgba(0,105,72,0.2)] hover:bg-brand-dark active:scale-[0.99]",
        variant === "secondary" &&
          "border border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50",
        variant === "outline" &&
          "border border-emerald-600 bg-white text-emerald-700 shadow-sm hover:bg-emerald-50",
        variant === "ghost" && "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
