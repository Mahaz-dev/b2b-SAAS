import { Environment, Paddle } from "@paddle/paddle-node-sdk";
import { env } from "@/lib/env";

export function isPaddleConfigured() {
  return Boolean(env.PADDLE_API_KEY && env.PADDLE_PRICE_ID && env.PADDLE_WEBHOOK_SECRET);
}

export function getPaddleClient() {
  if (!env.PADDLE_API_KEY) {
    return null;
  }
  return new Paddle(env.PADDLE_API_KEY, {
    environment: env.PADDLE_ENVIRONMENT === "production" ? Environment.production : Environment.sandbox,
  });
}
