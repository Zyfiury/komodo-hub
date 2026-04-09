"use client";

import { useActionState } from "react";
import { reviewSubmission, type SimpleState } from "@/app/actions/submissions";
import { SubmissionReviewState } from "@/lib/constants";

export function ReviewForm({
  submissionId,
  initialFeedback,
  initialState,
}: {
  submissionId: string;
  initialFeedback: string;
  initialState: string;
}) {
  const bound = reviewSubmission.bind(null, submissionId);
  const [state, action, pending] = useActionState(bound, {} as SimpleState);

  return (
    <form action={action} className="mt-8 space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-sm font-medium">Review</h3>
      <label className="block text-sm">
        Feedback for student
        <textarea
          name="teacherFeedback"
          rows={4}
          defaultValue={initialFeedback}
          className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950"
        />
      </label>
      <label className="block text-sm">
        Review state
        <select name="reviewState" defaultValue={initialState} className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950">
          {Object.values(SubmissionReviewState).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="rounded bg-emerald-700 px-4 py-2 text-sm text-white disabled:opacity-60">
        {pending ? "Saving…" : "Save review"}
      </button>
    </form>
  );
}
