import { redirect } from "next/navigation";
import Link from "next/link";
import { OnboardingForm } from "@/components/onboarding-form";
import { Logo } from "@/components/logo";
import { getCurrentOrganization } from "@/lib/organizations";
import { requireUser } from "@/lib/session";

export default async function OnboardingPage() {
  await requireUser();
  const organization = await getCurrentOrganization();
  if (organization) {
    redirect("/dashboard");
  }
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="flex items-center justify-between bg-white px-4 py-3 shadow-sm sm:px-6">
        <Logo />
        <span className="rounded-full bg-panel px-2.5 py-1 text-xs font-medium text-slate-600">
          14d Trial
        </span>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8">
        <div className="mb-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-slate-600">
              Step 1 of 2: Workspace Setup
            </span>
            <span className="font-semibold tabular-nums text-brand">50%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-panel">
            <div className="h-full w-1/2 rounded-full bg-brand" />
          </div>
        </div>
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Name your organization</h1>
            <p className="mt-1.5 leading-relaxed text-slate-600">
              This is the name of your agency, consultancy, or firm. We will use this to identify
              your workspace and label your invoice batches.
            </p>
          </div>
          <OnboardingForm />
          <div className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-panel p-3">
            <p className="text-xs leading-relaxed text-slate-600">
              Read-only connection will be established next, on your dashboard. We never alter
              your accounting ledger.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
