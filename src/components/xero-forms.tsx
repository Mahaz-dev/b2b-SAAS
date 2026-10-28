"use client";

import { useActionState } from "react";
import {
  connectXeroAction,
  disconnectXeroAction,
  syncXeroAction,
  type XeroState,
} from "@/actions/xero";
import { Button } from "@/components/ui/button";

const initialState: XeroState = { status: "idle" };

export function ConnectXeroForm() {
  const [state, action, pending] = useActionState(connectXeroAction, initialState);

  return (
    <form action={action} className="flex flex-col items-start gap-2">
      <Button type="submit" disabled={pending}>
        {pending ? "Redirecting…" : "Connect Xero"}
      </Button>
      {state.status === "not_configured" && (
        <p className="text-sm text-slate-600">Xero setup is still in progress.</p>
      )}
      {state.status === "error" && (
        <p className="text-sm text-red-700">Xero could not be connected. Try again.</p>
      )}
    </form>
  );
}

export function SyncXeroForm() {
  const [state, action, pending] = useActionState(syncXeroAction, initialState);

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
      {state.status === "no_connection" && <p className="text-sm text-slate-600">Xero is not connected.</p>}
      {state.status === "error" && <p className="text-sm text-red-700">Sync failed. Try again.</p>}
    </form>
  );
}

export function DisconnectXeroForm() {
  const [state, action, pending] = useActionState(disconnectXeroAction, initialState);

  return (
    <form action={action} className="flex flex-col items-start gap-2">
      <Button variant="ghost" type="submit" disabled={pending}>
        {pending ? "Disconnecting…" : "Disconnect"}
      </Button>
      {state.status === "error" && <p className="text-sm text-red-700">Disconnect failed. Try again.</p>}
    </form>
  );
}
