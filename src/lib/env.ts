import { z } from "zod";

if (typeof window !== "undefined") {
  throw new Error("env must only be read on the server");
}

const envSchema = z.object({
  AUTH_SECRET: z.string().min(1),
  AUTH_URL: z.string().url().optional(),
  DATABASE_URL: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  PADDLE_API_KEY: z.string().optional(),
  PADDLE_ENVIRONMENT: z.enum(["sandbox", "production"]).default("sandbox"),
  PADDLE_PRICE_ID: z.string().optional(),
  PADDLE_WEBHOOK_SECRET: z.string().optional(),
  QBO_CLIENT_ID: z.string().optional(),
  QBO_CLIENT_SECRET: z.string().optional(),
  QBO_ENVIRONMENT: z.enum(["sandbox", "production"]).default("sandbox"),
  QBO_REDIRECT_URI: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);
