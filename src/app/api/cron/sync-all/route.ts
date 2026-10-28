import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { syncAllOrganizations } from "@/lib/sync-all";

export async function GET(request: Request) {
  if (!env.CRON_SECRET) {
    return NextResponse.json({ error: "Cron not configured" }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const results = await syncAllOrganizations();
  return NextResponse.json({ results });
}
