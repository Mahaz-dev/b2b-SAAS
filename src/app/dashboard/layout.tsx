import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { getCurrentOrganization } from "@/lib/organizations";
import { requireUser } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireUser();
  const organization = await getCurrentOrganization();
  if (!organization) {
    redirect("/onboarding");
  }
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <span className="font-bold tracking-tight">ChaseUp</span>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">
                Dashboard
              </Link>
              <Link href="/dashboard/queue" className="text-slate-600 hover:text-slate-900">
                Call queue
              </Link>
              <Link href="/dashboard/billing" className="text-slate-600 hover:text-slate-900">
                Billing
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{organization.name}</span>
            <form action={signOutAction}>
              <Button variant="secondary" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
