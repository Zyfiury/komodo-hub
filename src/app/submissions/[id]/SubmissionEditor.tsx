"use client";

import { useActionState } from "react";
import type { SimpleState } from "@/app/actions/submissions";

export function SubmissionEditor({
  submissionId,
  initialContent,
  saveAction,
}: {
  submissionId: string;
  initialContent: string;
  saveAction: (id: string, prev: SimpleState, fd: FormData) => Promise<SimpleState>;
}) {
  const bound = saveAction.bind(null, submissionId);
  const [state, action, pending] = useActionState(bound, {});

  return (
    <form action={action} className="mt-8 space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <label className="block text-sm font-medium">
        Your work
        <textarea
          name="content"
          rows={10}
          defaultValue={initialContent}
          className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950"
        />
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="rounded bg-emerald-700 px-4 py-2 text-sm text-white disabled:opacity-60">
        {pending ? "Saving…" : "Save draft"}
      </button>
    </form>
  );
}
