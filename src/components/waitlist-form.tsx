"use client";

import { useActionState } from "react";
import { joinWaitlist, type WaitlistState } from "@/actions/waitlist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: WaitlistState = { status: "idle" };

export function WaitlistForm() {
  const [state, action, pending] = useActionState(joinWaitlist, initialState);

  if (state.status === "success") {
    return (
      <p className="rounded-lg bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800">
        You are on the list. We will email you when ChaseUp opens.
      </p>
    );
  }

  return (
    <form action={action} className="flex w-full max-w-md flex-col gap-3">
      <Input name="email" type="email" required placeholder="Work email" autoComplete="email" />
      <Input name="company" placeholder="Company (optional)" autoComplete="organization" />
      <Button type="submit" disabled={pending}>
        {pending ? "Joining…" : "Join the waitlist"}
      </Button>
      {state.status === "already" && (
        <p className="text-sm text-slate-600">That email is already on the list.</p>
      )}
      {state.status === "error" && (
        <p className="text-sm text-red-700">That email does not look right. Try again.</p>
      )}
    </form>
  );
}
