"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createOrganization } from "@/lib/organizations";
import { requireUser } from "@/lib/session";

const organizationSchema = z.object({
  name: z.string().trim().min(1).max(200),
});

export type OrganizationState = {
  status: "error" | "idle";
};

export async function createOrganizationAction(
  _previous: OrganizationState,
  formData: FormData,
): Promise<OrganizationState> {
  const user = await requireUser();
  const parsed = organizationSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { status: "error" };
  }
  try {
    await createOrganization(user.id, parsed.data.name);
  } catch {
    return { status: "error" };
  }
  redirect("/dashboard");
}
