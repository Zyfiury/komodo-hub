"use client";

import { useActionState } from "react";
import { createActivity, type SimpleState } from "@/app/actions/programmes";

const initial: SimpleState = {};

export function ActivityCreateForm({ programmeId }: { programmeId: string }) {
  const [state, action, pending] = useActionState(createActivity.bind(null, programmeId), initial);

  return (
    <form action={action} className="mt-8 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-sm font-medium">Add activity</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm sm:col-span-2">
          Title
          <input name="title" required className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950" />
        </label>
        <label className="text-sm sm:col-span-2">
          Description
          <textarea name="description" rows={2} className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950" />
        </label>
        <label className="text-sm">
          Due date
          <input name="dueDate" type="datetime-local" className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950" />
        </label>
        {state.error && <p className="text-sm text-red-600 sm:col-span-2">{state.error}</p>}
        <button type="submit" disabled={pending} className="rounded bg-emerald-700 px-4 py-2 text-sm text-white sm:col-span-2 disabled:opacity-60">
          {pending ? "Saving…" : "Create activity"}
        </button>
      </div>
    </form>
  );
}
