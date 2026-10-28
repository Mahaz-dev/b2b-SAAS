import { redirect } from "next/navigation";
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
          <span className="font-bold tracking-tight">ChaseUp</span>
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
