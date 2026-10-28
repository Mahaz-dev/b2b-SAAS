import { cache } from "react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { memberships, organizations, users } from "@/lib/schema";
import { requireUser } from "@/lib/session";

export const getCurrentOrganization = cache(async () => {
  const user = await requireUser();
  const rows = await db
    .select({ organization: organizations })
    .from(memberships)
    .innerJoin(organizations, eq(memberships.organizationId, organizations.id))
    .where(eq(memberships.userId, user.id))
    .orderBy(asc(organizations.createdAt))
    .limit(1);
  return rows[0]?.organization ?? null;
});

export async function getOrganizationMembers(organizationId: string) {
  return db
    .select({ membership: memberships, user: users })
    .from(memberships)
    .innerJoin(users, eq(memberships.userId, users.id))
    .where(eq(memberships.organizationId, organizationId))
    .orderBy(asc(memberships.createdAt));
}

function toSlug(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "org";
}

async function slugTaken(slug: string) {
  const rows = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.slug, slug))
    .limit(1);
  return rows.length > 0;
}

export async function createOrganization(userId: string, name: string) {
  const base = toSlug(name);
  let slug = base;
  let suffix = 2;
  while (await slugTaken(slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return db.transaction(async (tx) => {
    const [organization] = await tx
      .insert(organizations)
      .values({ name, slug })
      .returning();
    await tx.insert(memberships).values({ organizationId: organization.id, role: "OWNER", userId });
    return organization;
  });
}
