import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  description:
    "ChaseUp connects to QuickBooks or Xero, sends the follow-ups, and tells you exactly who to call today.",
  title: "ChaseUp — Overdue invoices chase themselves",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
