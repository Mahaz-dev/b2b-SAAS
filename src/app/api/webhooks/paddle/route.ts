import { Webhooks } from "@paddle/paddle-node-sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { subscriptions } from "@/lib/schema";

const subscriptionEventSchema = z.object({
  data: z.object({
    current_billing_period: z
      .object({ ends_at: z.string().nullable() })
      .nullable(),
    custom_data: z.object({ organization_id: z.string() }).nullable(),
    customer_id: z.string(),
    id: z.string(),
    status: z.string(),
  }),
  event_type: z.string(),
});

const subscriptionEventTypes = [
  "subscription_canceled",
  "subscription_created",
  "subscription_paused",
  "subscription_resumed",
  "subscription_updated",
];

export async function POST(request: Request) {
  const signature = request.headers.get("paddle-signature");
  const secret = env.PADDLE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }
  const body = await request.text();
  const valid = await new Webhooks().isSignatureValid(body, secret, signature);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const parsed = subscriptionEventSchema.safeParse(payload);
  if (!parsed.success || !subscriptionEventTypes.includes(parsed.data.event_type)) {
    return NextResponse.json({ received: true });
  }
  const data = parsed.data.data;
  if (!data.custom_data) {
    return NextResponse.json({ received: true });
  }
  await db
    .insert(subscriptions)
    .values({
      currentPeriodEnd: data.current_billing_period?.ends_at
        ? new Date(data.current_billing_period.ends_at)
        : null,
      organizationId: data.custom_data.organization_id,
      paddleCustomerId: data.customer_id,
      paddleSubscriptionId: data.id,
      status: data.status,
    })
    .onConflictDoUpdate({
      set: {
        currentPeriodEnd: data.current_billing_period?.ends_at
          ? new Date(data.current_billing_period.ends_at)
          : null,
        paddleCustomerId: data.customer_id,
        status: data.status,
      },
      target: subscriptions.paddleSubscriptionId,
    });
  return NextResponse.json({ received: true });
}
