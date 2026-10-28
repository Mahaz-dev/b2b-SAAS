import { db } from "@/lib/db";
import { qboConnections, xeroConnections } from "@/lib/schema";
import { syncQuickBooks } from "@/lib/qbo-sync";
import { syncXero } from "@/lib/xero-sync";

export type SyncAllResult = {
  organizationId: string;
  source: string;
  status: string;
};

export async function syncAllOrganizations(): Promise<SyncAllResult[]> {
  const qboOrgs = await db
    .select({ organizationId: qboConnections.organizationId })
    .from(qboConnections);
  const xeroOrgs = await db
    .select({ organizationId: xeroConnections.organizationId })
    .from(xeroConnections);
  const results: SyncAllResult[] = [];
  for (const row of qboOrgs) {
    const result = await syncQuickBooks(row.organizationId);
    results.push({ organizationId: row.organizationId, source: "quickbooks", status: result.status });
  }
  for (const row of xeroOrgs) {
    const result = await syncXero(row.organizationId);
    results.push({ organizationId: row.organizationId, source: "xero", status: result.status });
  }
  return results;
}
