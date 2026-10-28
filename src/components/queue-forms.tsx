"use client";

import { useActionState } from "react";
import {
  logCallAction,
  logReminderSentAction,
  openDisputeAction,
  recordPromiseAction,
  resolveDisputeAction,
  type ChaseState,
} from "@/actions/chase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ChaseState = { status: "idle" };

export function LogCallForm({ invoiceId }: { invoiceId: string }) {
  const [state, action, pending] = useActionState(logCallAction, initialState);

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <Input name="note" required maxLength={2000} placeholder="Call outcome, e.g. promised to pay Friday" />
      <Button variant="secondary" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Log call"}
      </Button>
      {state.status === "ok" && <p className="text-sm text-slate-600">Call logged.</p>}
      {state.status === "error" && <p className="text-sm text-red-700">Could not log the call.</p>}
    </form>
  );
}

export function PromiseForm({ invoiceId }: { invoiceId: string }) {
  const [state, action, pending] = useActionState(recordPromiseAction, initialState);

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <div className="flex gap-2">
        <Input name="promisedDate" type="date" required aria-label="Promised date" />
        <Input
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          placeholder="Amount"
          aria-label="Promised amount"
        />
      </div>
      <Input name="note" maxLength={2000} placeholder="Note (optional)" />
      <Button variant="secondary" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Record promise"}
      </Button>
      {state.status === "ok" && <p className="text-sm text-slate-600">Promise recorded.</p>}
      {state.status === "already_exists" && (
        <p className="text-sm text-slate-600">This invoice already has an open promise.</p>
      )}
      {state.status === "error" && <p className="text-sm text-red-700">Could not record the promise.</p>}
    </form>
  );
}

export function DisputeForm({ invoiceId }: { invoiceId: string }) {
  const [state, action, pending] = useActionState(openDisputeAction, initialState);

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <Input name="reason" required maxLength={2000} placeholder="What is disputed?" />
      <Button variant="secondary" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Pause for dispute"}
      </Button>
      {state.status === "ok" && <p className="text-sm text-slate-600">Invoice paused for dispute.</p>}
      {state.status === "already_exists" && (
        <p className="text-sm text-slate-600">This invoice already has an open dispute.</p>
      )}
      {state.status === "error" && <p className="text-sm text-red-700">Could not open the dispute.</p>}
    </form>
  );
}

export function ResolveDisputeForm({ disputeId }: { disputeId: string }) {
  const [state, action, pending] = useActionState(resolveDisputeAction, initialState);

  return (
    <form action={action} className="flex flex-col items-start gap-2">
      <input type="hidden" name="disputeId" value={disputeId} />
      <Button variant="secondary" size="sm" type="submit" disabled={pending}>
        {pending ? "Resolving…" : "Resolve dispute"}
      </Button>
      {state.status === "error" && <p className="text-sm text-red-700">Could not resolve the dispute.</p>}
    </form>
  );
}

export function LogReminderForm({ invoiceId, step }: { invoiceId: string; step: number }) {
  const [state, action, pending] = useActionState(logReminderSentAction, initialState);

  return (
    <form action={action} className="flex flex-col items-start gap-2">
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <input type="hidden" name="step" value={step} />
      <Button variant="secondary" size="sm" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Log reminder sent"}
      </Button>
      {state.status === "ok" && <p className="text-sm text-slate-600">Reminder logged.</p>}
      {state.status === "error" && <p className="text-sm text-red-700">Could not log the reminder.</p>}
    </form>
  );
}
