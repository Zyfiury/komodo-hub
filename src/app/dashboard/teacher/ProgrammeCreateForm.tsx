"use client";

import { useActionState } from "react";
import { createProgramme, type SimpleState } from "@/app/actions/programmes";

const initial: SimpleState = {};

export function ProgrammeCreateForm() {
  const [state, action, pending] = useActionState(createProgramme, initial);

  return (
    <form action={action} className="mt-10 space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-medium">Create programme</h2>
      <label className="block text-sm">
        Title
        <input name="title" required className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950" />
      </label>
      <label className="block text-sm">
        Description
        <textarea name="description" rows={2} className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950" />
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="rounded bg-emerald-700 px-4 py-2 text-sm text-white disabled:opacity-60">
        {pending ? "Creating…" : "Create programme"}
      </button>
    </form>
  );
}
