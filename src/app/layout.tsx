import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const serifAccent = Instrument_Serif({
  style: ["italic"],
  subsets: ["latin"],
  variable: "--font-serif-accent",
  weight: ["400"],
});

export const metadata: Metadata = {
  description:
    "ChaseUp connects to QuickBooks or Xero, sends the follow-ups, and tells you exactly who to call today.",
  title: "ChaseUp — Overdue invoices chase themselves",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${serifAccent.variable} bg-surface font-sans text-ink antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
