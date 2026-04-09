"use client";

import { useActionState } from "react";
import { createSchoolAccessCode, type CodeActionState } from "@/app/actions/accessCode";

const initial: CodeActionState = {};

export function AccessCodeForm() {
  const [state, action, pending] = useActionState(createSchoolAccessCode, initial);

  return (
    <form action={action} className="mt-4 flex flex-wrap items-end gap-3">
      <label className="text-sm">
        Max uses
        <input name="maxUses" type="number" min={1} max={500} defaultValue={50} className="mt-1 block rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950" />
      </label>
      <label className="text-sm">
        Expires (optional)
        <input name="expiresAt" type="datetime-local" className="mt-1 block rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950" />
      </label>
      <button type="submit" disabled={pending} className="rounded bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
        {pending ? "Creating…" : "Generate code"}
      </button>
      {state.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
      {state.code && (
        <p className="w-full text-sm text-emerald-800 dark:text-emerald-300">
          New code: <code>{state.code}</code>
        </p>
      )}
    </form>
  );
}
