import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { getCurrentOrganization, getOrganizationMembers } from "@/lib/organizations";

export default async function DashboardPage() {
  const organization = await getCurrentOrganization();
  if (!organization) {
    redirect("/onboarding");
  }
  const members = await getOrganizationMembers(organization.id);
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">{organization.name}</h1>
      <Card title="Overdue invoices">
        <p className="text-sm text-slate-600">
          No invoices synced yet. Connect QuickBooks to see what is overdue here.
        </p>
      </Card>
      <Card title="Connect QuickBooks">
        <p className="text-sm text-slate-600">
          QuickBooks connection arrives in the next build. Once connected, invoices, customers,
          and payments will sync here automatically.
        </p>
      </Card>
      <Card title="Members">
        <ul className="flex flex-col gap-2">
          {members.map(({ membership, user }) => (
            <li key={membership.id} className="flex items-center justify-between text-sm">
              <span>{user.name ?? user.email ?? "Member"}</span>
              <span className="text-slate-500">{membership.role}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
