"use client";

import { useActionState } from "react";
import { createOrganizationAction, type OrganizationState } from "@/actions/organizations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: OrganizationState = { status: "idle" };

export function OnboardingForm() {
  const [state, action, pending] = useActionState(createOrganizationAction, initialState);

  return (
    <form action={action} className="flex w-full flex-col gap-3">
      <Input name="name" required maxLength={200} placeholder="Acme Studio" autoComplete="organization" />
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Continue"}
      </Button>
      {state.status === "error" && (
        <p className="text-sm text-red-700">Could not create that organization. Try a different name.</p>
      )}
    </form>
  );
}
