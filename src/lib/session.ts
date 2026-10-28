import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const getCurrentUser = cache(async () => {
  const session = await auth();
  return session?.user ?? null;
});

export async function requireUser() {
  const user = await getCurrentUser();
  const userId = user?.id;
  if (!userId) {
    redirect("/api/auth/signin");
  }
  return { ...user, id: userId };
}
