"use client";

import { useActionState } from "react";
import { sendOrganisationMessage, type SimpleState } from "@/app/actions/messages";

const initial: SimpleState = {};

type Peer = { id: string; name: string; role: string };

export function MessageComposeForm({ peers }: { peers: Peer[] }) {
  const [state, action, pending] = useActionState(sendOrganisationMessage, initial);

  return (
    <form action={action} className="mt-6 space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-sm font-medium">Compose</h2>
      <label className="block text-sm">
        To
        <select name="toUserId" required className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950">
          <option value="">Select recipient</option>
          {peers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.role})
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Message
        <textarea name="body" rows={3} required className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950" />
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="rounded bg-emerald-700 px-4 py-2 text-sm text-white disabled:opacity-60">
        {pending ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
