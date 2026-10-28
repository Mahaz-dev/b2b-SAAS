"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { waitlistEntries } from "@/lib/schema";

const waitlistSchema = z.object({
  company: z.string().max(200).optional(),
  email: z.string().email(),
});

export type WaitlistState = {
  status: "already" | "error" | "idle" | "success";
};

export async function joinWaitlist(
  _previous: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  const parsed = waitlistSchema.safeParse({
    company: formData.get("company") || undefined,
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { status: "error" };
  }

  const existing = await db
    .select()
    .from(waitlistEntries)
    .where(eq(waitlistEntries.email, parsed.data.email))
    .limit(1);

  if (existing.length > 0) {
    return { status: "already" };
  }

  await db.insert(waitlistEntries).values({
    company: parsed.data.company,
    email: parsed.data.email,
  });

  return { status: "success" };
}
