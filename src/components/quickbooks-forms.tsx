"use client";

import { useActionState } from "react";
import {
  connectQuickBooksAction,
  disconnectQuickBooksAction,
  syncQuickBooksAction,
  type QuickBooksState,
} from "@/actions/quickbooks";
import { Button } from "@/components/ui/button";

const initialState: QuickBooksState = { status: "idle" };

export function ConnectQuickBooksForm() {
  const [state, action, pending] = useActionState(connectQuickBooksAction, initialState);

  return (
    <form action={action} className="flex flex-col items-start gap-2">
      <Button type="submit" disabled={pending}>
        {pending ? "Redirecting…" : "Connect QuickBooks"}
      </Button>
      {state.status === "not_configured" && (
        <p className="text-sm text-slate-600">QuickBooks setup is still in progress.</p>
      )}
      {state.status === "error" && (
        <p className="text-sm text-red-700">QuickBooks could not be connected. Try again.</p>
      )}
    </form>
  );
}

export function SyncQuickBooksForm() {
  const [state, action, pending] = useActionState(syncQuickBooksAction, initialState);

  return (
    <form action={action} className="flex flex-col items-start gap-2">
      <Button variant="outline" type="submit" disabled={pending}>
        {pending ? "Syncing…" : "Sync now"}
      </Button>
      {state.status === "ok" && (
        <p className="text-sm text-slate-600">
          Synced {state.customers} customers and {state.invoices} invoices.
        </p>
      )}
      {state.status === "no_connection" && (
        <p className="text-sm text-slate-600">QuickBooks is not connected.</p>
      )}
      {state.status === "error" && (
        <p className="text-sm text-red-700">Sync failed. Try again.</p>
      )}
    </form>
  );
}

export function DisconnectQuickBooksForm() {
  const [state, action, pending] = useActionState(disconnectQuickBooksAction, initialState);

  return (
    <form action={action} className="flex flex-col items-start gap-2">
      <Button variant="ghost" type="submit" disabled={pending}>
        {pending ? "Disconnecting…" : "Disconnect"}
      </Button>
      {state.status === "error" && (
        <p className="text-sm text-red-700">Disconnect failed. Try again.</p>
      )}
    </form>
  );
}
