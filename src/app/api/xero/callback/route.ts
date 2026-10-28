import { NextResponse } from "next/server";
import { completeXeroConnect } from "@/lib/xero";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) {
    return NextResponse.redirect(new URL("/dashboard?xero=error", request.url));
  }
  const result = await completeXeroConnect(code, state);
  if (!result.ok) {
    return NextResponse.redirect(new URL("/dashboard?xero=error", request.url));
  }
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
