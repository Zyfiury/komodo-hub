"use client";

import { useActionState } from "react";
import { createLibraryDraft, type SimpleState } from "@/app/actions/library";
import { LibraryItemType, LibraryAudience } from "@/lib/constants";

const initial: SimpleState = {};

export function LibraryDraftForm() {
  const [state, action, pending] = useActionState(createLibraryDraft, initial);

  return (
    <form action={action} className="mt-4 grid gap-3 sm:grid-cols-2">
      <label className="text-sm sm:col-span-2">
        Title
        <input name="title" required className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950" />
      </label>
      <label className="text-sm sm:col-span-2">
        Body
        <textarea name="body" rows={4} className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950" />
      </label>
      <label className="text-sm">
        Type
        <select name="type" defaultValue="CONTRIBUTION" className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950">
          {Object.values(LibraryItemType).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        Audience
        <select name="audience" defaultValue={LibraryAudience.PUBLIC} className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950">
          {Object.values(LibraryAudience).map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </label>
      {state.error && <p className="text-sm text-red-600 sm:col-span-2">{state.error}</p>}
      {state.id && <p className="text-sm text-emerald-800 sm:col-span-2 dark:text-emerald-300">Draft saved. Id: {state.id}</p>}
      <button type="submit" disabled={pending} className="rounded bg-emerald-700 px-4 py-2 text-sm text-white sm:col-span-2 disabled:opacity-60">
        {pending ? "Saving…" : "Save draft"}
      </button>
    </form>
  );
}
