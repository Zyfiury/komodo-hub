import { redirect } from "next/navigation";
import { ensureSubmissionForActivity } from "@/app/actions/submissions";

export function StartSubmissionButton({ activityId }: { activityId: string }) {
  async function start() {
    "use server";
    const id = await ensureSubmissionForActivity(activityId);
    if (id) redirect(`/submissions/${id}`);
  }

  return (
    <form action={start}>
      <button type="submit" className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white">
        Create submission
      </button>
    </form>
  );
}
