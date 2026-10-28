import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { decryptText, encryptText, signValue, verifySignedValue } from "@/lib/crypto";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { getCurrentOrganization } from "@/lib/organizations";
import { customers, invoices, xeroConnections } from "@/lib/schema";
import { getCurrentUser } from "@/lib/session";

export type XeroConnection = typeof xeroConnections.$inferSelect;

const TOKEN_URL = "https://identity.xero.com/connect/token";
const AUTHORIZATION_URL = "https://login.xero.com/identity/connect/authorize";
const CONNECTIONS_URL = "https://api.xero.com/connections";
const API_BASE = "https://api.xero.com/api.xro/2.0";
const SCOPE =
  "openid profile email accounting.transactions.read accounting.contacts.read offline_access";

const tokenResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  refresh_token: z.string(),
});

const tenantSchema = z.object({
  tenantId: z.string(),
  tenantName: z.string().nullish(),
});

export function isXeroConfigured() {
  return Boolean(env.XERO_CLIENT_ID && env.XERO_CLIENT_SECRET && getXeroRedirectUri());
}

export function getXeroRedirectUri() {
  if (env.XERO_REDIRECT_URI) {
    return env.XERO_REDIRECT_URI;
  }
  if (env.AUTH_URL) {
    return `${env.AUTH_URL}/api/xero/callback`;
  }
  return null;
}

export function getXeroAuthorizationUrl(organizationId: string) {
  const redirectUri = getXeroRedirectUri();
  if (!redirectUri || !env.XERO_CLIENT_ID) {
    return null;
  }
  const url = new URL(AUTHORIZATION_URL);
  url.searchParams.set("client_id", env.XERO_CLIENT_ID);
  url.searchParams.set("scope", SCOPE);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", signValue(organizationId));
  return url.toString();
}

export async function getXeroConnection(organizationId: string) {
  const rows = await db
    .select()
    .from(xeroConnections)
    .where(eq(xeroConnections.organizationId, organizationId))
    .limit(1);
  return rows[0] ?? null;
}

export async function disconnectXero(organizationId: string) {
  await db.transaction(async (tx) => {
    await tx
      .delete(invoices)
      .where(and(eq(invoices.organizationId, organizationId), eq(invoices.source, "xero")));
    await tx
      .delete(customers)
      .where(and(eq(customers.organizationId, organizationId), eq(customers.source, "xero")));
    await tx.delete(xeroConnections).where(eq(xeroConnections.organizationId, organizationId));
  });
}

export function parseXeroDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }
  const match = /\/Date\((-?\d+)/.exec(value);
  if (!match) {
    return null;
  }
  return new Date(Number(match[1]));
}

async function requestTokens(body: Record<string, string>) {
  const res = await fetch(TOKEN_URL, {
    body: new URLSearchParams(body),
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${Buffer.from(`${env.XERO_CLIENT_ID}:${env.XERO_CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  if (!res.ok) {
    throw new Error("Xero token request failed");
  }
  return tokenResponseSchema.parse(await res.json());
}

async function refreshAccessToken(connection: XeroConnection) {
  const tokens = await requestTokens({
    grant_type: "refresh_token",
    refresh_token: decryptText(connection.refreshToken),
  });
  await db
    .update(xeroConnections)
    .set({
      accessToken: encryptText(tokens.access_token),
      refreshToken: encryptText(tokens.refresh_token),
      tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    })
    .where(eq(xeroConnections.id, connection.id));
  return tokens.access_token;
}

async function getValidAccessToken(connection: XeroConnection) {
  if (connection.tokenExpiresAt.getTime() > Date.now() + 60_000) {
    return decryptText(connection.accessToken);
  }
  return refreshAccessToken(connection);
}

async function xeroGet(connection: XeroConnection, path: string) {
  const url = `${API_BASE}${path}`;
  const headers = (token: string) => ({
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
    "Xero-tenant-id": connection.tenantId,
  });
  const token = await getValidAccessToken(connection);
  const res = await fetch(url, { headers: headers(token) });
  if (res.status === 401) {
    const refreshed = await refreshAccessToken(connection);
    return fetch(url, { headers: headers(refreshed) });
  }
  return res;
}

export async function xeroGetPages(connection: XeroConnection, path: string, key: string) {
  const records: unknown[] = [];
  let page = 1;
  for (;;) {
    const separator = path.includes("?") ? "&" : "?";
    const res = await xeroGet(connection, `${path}${separator}page=${page}`);
    if (!res.ok) {
      throw new Error("Xero request failed");
    }
    const payload = (await res.json()) as Record<string, unknown>;
    const items = payload[key];
    if (!Array.isArray(items) || items.length === 0) {
      break;
    }
    records.push(...items);
    page += 1;
  }
  return records;
}

export type XeroConnectResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "failed"
        | "invalid_state"
        | "no_tenant"
        | "not_configured"
        | "org_mismatch"
        | "token_exchange_failed"
        | "unauthenticated";
    };

export async function completeXeroConnect(code: string, state: string): Promise<XeroConnectResult> {
  try {
    const organizationId = verifySignedValue(state);
    if (!organizationId) {
      return { ok: false, reason: "invalid_state" };
    }
    const user = await getCurrentUser();
    if (!user?.id) {
      return { ok: false, reason: "unauthenticated" };
    }
    const organization = await getCurrentOrganization();
    if (!organization || organization.id !== organizationId) {
      return { ok: false, reason: "org_mismatch" };
    }
    const redirectUri = getXeroRedirectUri();
    if (!redirectUri) {
      return { ok: false, reason: "not_configured" };
    }
    let tokens;
    try {
      tokens = await requestTokens({
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      });
    } catch {
      return { ok: false, reason: "token_exchange_failed" };
    }
    const connectionsRes = await fetch(CONNECTIONS_URL, {
      headers: { Accept: "application/json", Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!connectionsRes.ok) {
      return { ok: false, reason: "failed" };
    }
    const tenants = z.array(tenantSchema).safeParse(await connectionsRes.json());
    if (!tenants.success || tenants.data.length === 0) {
      return { ok: false, reason: "no_tenant" };
    }
    const tenant = tenants.data[0];
    await db
      .insert(xeroConnections)
      .values({
        accessToken: encryptText(tokens.access_token),
        organizationId: organization.id,
        refreshToken: encryptText(tokens.refresh_token),
        tenantId: tenant.tenantId,
        tenantName: tenant.tenantName ?? null,
        tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      })
      .onConflictDoUpdate({
        set: {
          accessToken: encryptText(tokens.access_token),
          refreshToken: encryptText(tokens.refresh_token),
          tenantId: tenant.tenantId,
          tenantName: tenant.tenantName ?? null,
          tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        },
        target: xeroConnections.organizationId,
      });
    return { ok: true };
  } catch {
    return { ok: false, reason: "failed" };
  }
}
