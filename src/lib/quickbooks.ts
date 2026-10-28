import { eq } from "drizzle-orm";
import { z } from "zod";
import { decryptText, encryptText, signValue, verifySignedValue } from "@/lib/crypto";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { getCurrentOrganization } from "@/lib/organizations";
import { qboConnections, qboCustomers, qboInvoices } from "@/lib/schema";
import { getCurrentUser } from "@/lib/session";

export type QboConnection = typeof qboConnections.$inferSelect;

const TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
const AUTHORIZATION_URL = "https://appcenter.intuit.com/connect/oauth2";
const SCOPE = "com.intuit.quickbooks.accounting";

const tokenResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  refresh_token: z.string(),
});

const queryEnvelopeSchema = z.object({
  QueryResponse: z
    .object({
      maxResults: z.number().optional(),
      startPosition: z.number().optional(),
      totalCount: z.number().optional(),
    })
    .passthrough(),
});

export function isQuickBooksConfigured() {
  return Boolean(env.QBO_CLIENT_ID && env.QBO_CLIENT_SECRET && getQuickBooksRedirectUri());
}

export function getQuickBooksRedirectUri() {
  if (env.QBO_REDIRECT_URI) {
    return env.QBO_REDIRECT_URI;
  }
  if (env.AUTH_URL) {
    return `${env.AUTH_URL}/api/quickbooks/callback`;
  }
  return null;
}

export function getQuickBooksAuthorizationUrl(organizationId: string) {
  const redirectUri = getQuickBooksRedirectUri();
  if (!redirectUri || !env.QBO_CLIENT_ID) {
    return null;
  }
  const url = new URL(AUTHORIZATION_URL);
  url.searchParams.set("client_id", env.QBO_CLIENT_ID);
  url.searchParams.set("scope", SCOPE);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", signValue(organizationId));
  return url.toString();
}

export async function getQboConnection(organizationId: string) {
  const rows = await db
    .select()
    .from(qboConnections)
    .where(eq(qboConnections.organizationId, organizationId))
    .limit(1);
  return rows[0] ?? null;
}

export async function disconnectQuickBooks(organizationId: string) {
  await db.transaction(async (tx) => {
    await tx.delete(qboInvoices).where(eq(qboInvoices.organizationId, organizationId));
    await tx.delete(qboCustomers).where(eq(qboCustomers.organizationId, organizationId));
    await tx.delete(qboConnections).where(eq(qboConnections.organizationId, organizationId));
  });
}

function apiBase() {
  return env.QBO_ENVIRONMENT === "production"
    ? "https://quickbooks.api.intuit.com"
    : "https://sandbox-quickbooks.api.intuit.com";
}

async function requestTokens(body: Record<string, string>) {
  const res = await fetch(TOKEN_URL, {
    body: new URLSearchParams(body),
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${Buffer.from(`${env.QBO_CLIENT_ID}:${env.QBO_CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  if (!res.ok) {
    throw new Error("QuickBooks token request failed");
  }
  return tokenResponseSchema.parse(await res.json());
}

async function refreshAccessToken(connection: QboConnection) {
  const tokens = await requestTokens({
    grant_type: "refresh_token",
    refresh_token: decryptText(connection.refreshToken),
  });
  await db
    .update(qboConnections)
    .set({
      accessToken: encryptText(tokens.access_token),
      refreshToken: encryptText(tokens.refresh_token),
      tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    })
    .where(eq(qboConnections.id, connection.id));
  return tokens.access_token;
}

async function getValidAccessToken(connection: QboConnection) {
  if (connection.tokenExpiresAt.getTime() > Date.now() + 60_000) {
    return decryptText(connection.accessToken);
  }
  return refreshAccessToken(connection);
}

async function qboGet(connection: QboConnection, path: string) {
  const url = `${apiBase()}/v3/company/${connection.realmId}${path}`;
  const token = await getValidAccessToken(connection);
  const res = await fetch(url, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    const refreshed = await refreshAccessToken(connection);
    return fetch(url, {
      headers: { Accept: "application/json", Authorization: `Bearer ${refreshed}` },
    });
  }
  return res;
}

export async function qboQueryAll(connection: QboConnection, entityKey: string, query: string) {
  const pageSize = 1000;
  const records: unknown[] = [];
  let start = 1;
  for (;;) {
    const res = await qboGet(
      connection,
      `/query?query=${encodeURIComponent(`${query} STARTPOSITION ${start} MAXRESULTS ${pageSize}`)}`,
    );
    if (!res.ok) {
      throw new Error("QuickBooks query failed");
    }
    const envelope = queryEnvelopeSchema.parse(await res.json());
    const page = envelope.QueryResponse[entityKey];
    if (!Array.isArray(page)) {
      break;
    }
    records.push(...page);
    start += page.length;
    const total = envelope.QueryResponse.totalCount;
    if (page.length === 0 || page.length < pageSize || (total !== undefined && records.length >= total)) {
      break;
    }
  }
  return records;
}

export type QuickBooksConnectResult =
  | { ok: true }
  | { ok: false; reason: "failed" | "invalid_state" | "not_configured" | "org_mismatch" | "token_exchange_failed" | "unauthenticated" };

export async function completeQuickBooksConnect(
  code: string,
  state: string,
  realmId: string,
): Promise<QuickBooksConnectResult> {
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
    const redirectUri = getQuickBooksRedirectUri();
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
    await db
      .insert(qboConnections)
      .values({
        accessToken: encryptText(tokens.access_token),
        organizationId: organization.id,
        realmId,
        refreshToken: encryptText(tokens.refresh_token),
        tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      })
      .onConflictDoUpdate({
        set: {
          accessToken: encryptText(tokens.access_token),
          refreshToken: encryptText(tokens.refresh_token),
          tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        },
        target: qboConnections.organizationId,
      });
    return { ok: true };
  } catch {
    return { ok: false, reason: "failed" };
  }
}
