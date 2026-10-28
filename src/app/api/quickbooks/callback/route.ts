import { NextResponse } from "next/server";
import { completeQuickBooksConnect } from "@/lib/quickbooks";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const realmId = url.searchParams.get("realmId");
  if (!code || !state || !realmId) {
    return NextResponse.redirect(new URL("/dashboard?quickbooks=error", request.url));
  }
  const result = await completeQuickBooksConnect(code, state, realmId);
  if (!result.ok) {
    return NextResponse.redirect(new URL("/dashboard?quickbooks=error", request.url));
  }
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
