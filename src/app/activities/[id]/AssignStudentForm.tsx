import { assignActivity } from "@/app/actions/programmes";

type Student = { id: string; name: string };

export function AssignStudentForm({
  activityId,
  students,
  assignedIds,
}: {
  activityId: string;
  students: Student[];
  assignedIds: string[];
}) {
  const unassigned = students.filter((s) => !assignedIds.includes(s.id));

  if (unassigned.length === 0) {
    return <p className="mt-2 text-sm text-zinc-500">All students are already assigned.</p>;
  }

  return (
    <ul className="mt-3 space-y-2">
      {unassigned.map((s) => (
        <li key={s.id}>
          <AssignButton activityId={activityId} studentId={s.id} label={s.name} />
        </li>
      ))}
    </ul>
  );
}

function AssignButton({ activityId, studentId, label }: { activityId: string; studentId: string; label: string }) {
  async function run() {
    "use server";
    await assignActivity(activityId, studentId);
  }

  return (
    <form action={run}>
      <button type="submit" className="rounded border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800">
        Assign {label}
      </button>
    </form>
  );
}
