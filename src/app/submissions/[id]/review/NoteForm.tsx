"use client";

import { useActionState } from "react";
import { addTeacherNote, type SimpleState } from "@/app/actions/submissions";

export function NoteForm({ submissionId }: { submissionId: string }) {
  const bound = addTeacherNote.bind(null, submissionId);
  const [state, action, pending] = useActionState(bound, {} as SimpleState);

  return (
    <form action={action} className="mt-8 space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-sm font-medium">Add internal note</h3>
      <textarea name="body" rows={3} required className="w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-950" />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="rounded bg-zinc-800 px-4 py-2 text-sm text-white dark:bg-zinc-200 dark:text-zinc-900">
        {pending ? "Adding…" : "Add note"}
      </button>
    </form>
  );
}
