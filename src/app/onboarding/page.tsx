import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding-form";
import { getCurrentOrganization } from "@/lib/organizations";
import { requireUser } from "@/lib/session";

export default async function OnboardingPage() {
  await requireUser();
  const organization = await getCurrentOrganization();
  if (organization) {
    redirect("/dashboard");
  }
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight">Name your organization</h1>
      <p className="mt-2 text-slate-600">This is the business ChaseUp will chase invoices for.</p>
      <div className="mt-6">
        <OnboardingForm />
      </div>
    </main>
  );
}
