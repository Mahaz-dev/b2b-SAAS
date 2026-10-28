"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/cx";

const links = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <>
        <rect height="7" rx="1.5" width="7" x="3" y="3" />
        <rect height="7" rx="1.5" width="7" x="14" y="3" />
        <rect height="7" rx="1.5" width="7" x="3" y="14" />
        <rect height="7" rx="1.5" width="7" x="14" y="14" />
      </>
    ),
  },
  {
    href: "/dashboard/queue",
    label: "Call queue",
    icon: (
      <>
        <path d="M9 6h11M9 12h11M9 18h11" />
        <path d="M4 6h.01M4 12h.01M4 18h.01" />
      </>
    ),
  },
  {
    href: "/dashboard/invoices",
    label: "Invoices",
    icon: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M9 13h6M9 17h6" />
      </>
    ),
  },
  {
    href: "/dashboard/billing",
    label: "Billing",
    icon: (
      <>
        <rect height="16" rx="2" width="20" x="2" y="4" />
        <path d="M2 10h20" />
      </>
    ),
  },
];

function iconSvg(icon: React.ReactNode) {
  return (
    <svg
      className="h-4.5 w-4.5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {icon}
    </svg>
  );
}

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 px-3">
      {links.map((link) => {
        const active =
          link.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cx(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-slate-950 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
            )}
          >
            {iconSvg(link.icon)}
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-4 pb-3">
      {links.map((link) => {
        const active =
          link.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cx(
              "flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-slate-950 text-white"
                : "bg-slate-100 text-slate-600 hover:text-slate-950",
            )}
          >
            {iconSvg(link.icon)}
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
