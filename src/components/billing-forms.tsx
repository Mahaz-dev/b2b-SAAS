"use client";

import { useActionState } from "react";
import {
  createCheckoutAction,
  createPortalSessionAction,
  type BillingState,
} from "@/actions/billing";
import { Button } from "@/components/ui/button";

const initialState: BillingState = { status: "idle" };

export function SubscribeForm() {
  const [state, action, pending] = useActionState(createCheckoutAction, initialState);

  return (
    <form action={action} className="flex flex-col items-start gap-2">
      <Button type="submit" disabled={pending}>
        {pending ? "Redirecting…" : "Subscribe — $99/month"}
      </Button>
      {state.status === "error" && (
        <p className="text-sm text-red-700">Checkout could not be started. Try again.</p>
      )}
      {state.status === "not_configured" && (
        <p className="text-sm text-slate-600">Billing setup is still in progress.</p>
      )}
    </form>
  );
}

export function ManageBillingForm() {
  const [state, action, pending] = useActionState(createPortalSessionAction, initialState);

  return (
    <form action={action} className="flex flex-col items-start gap-2">
      <Button variant="secondary" type="submit" disabled={pending}>
        {pending ? "Redirecting…" : "Manage billing"}
      </Button>
      {state.status === "error" && (
        <p className="text-sm text-red-700">The billing portal could not be opened. Try again.</p>
      )}
      {state.status === "no_subscription" && (
        <p className="text-sm text-slate-600">No subscription found for this organization.</p>
      )}
      {state.status === "not_configured" && (
        <p className="text-sm text-slate-600">Billing setup is still in progress.</p>
      )}
    </form>
  );
}
