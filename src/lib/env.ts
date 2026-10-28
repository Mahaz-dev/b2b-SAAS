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
});

export const env = envSchema.parse(process.env);
