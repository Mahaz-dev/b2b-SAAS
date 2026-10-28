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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
          <h1 className="text-xl font-bold tracking-tight">Name your organization</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            This is the business ChaseUp will chase invoices for. You can add teammates after
            setup.
          </p>
          <div className="mt-6">
            <OnboardingForm />
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/" className="font-medium text-slate-700 hover:text-slate-950">
            ← Back to the homepage
          </Link>
        </p>
      </div>
    </div>
  );
}
