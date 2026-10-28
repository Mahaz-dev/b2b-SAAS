import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "md" | "sm";
  variant?: "primary" | "secondary";
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
        "inline-flex items-center justify-center rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40 disabled:cursor-not-allowed disabled:opacity-50",
        size === "md" && "px-5 py-2.5 text-sm",
        size === "sm" && "px-3 py-1.5 text-xs",
        variant === "primary" &&
          "bg-slate-950 text-white shadow-sm hover:bg-slate-800 active:scale-[0.99]",
        variant === "secondary" &&
          "border border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
