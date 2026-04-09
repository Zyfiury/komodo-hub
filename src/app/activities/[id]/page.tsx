import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { UserRole } from "@/lib/constants";
import { StartSubmissionButton } from "./StartSubmissionButton";
import { AssignStudentForm } from "./AssignStudentForm";

type Props = { params: Promise<{ id: string }> };

export default async function ActivityPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const activity = await prisma.activity.findFirst({
    where: { id, programme: { organisationId: session.organisationId } },
    include: {
      programme: true,
      assignments: { include: { student: { select: { id: true, name: true } }, submissions: true } },
    },
  });
  if (!activity) notFound();

  const canManage =
    session.role === UserRole.SCHOOL_ADMIN ||
    (session.role === UserRole.TEACHER && activity.programme.ownerId === session.sub);

  const studentAssignment = activity.assignments.find((a) => a.studentId === session.sub);

  const submissionId =
    session.role === UserRole.STUDENT && studentAssignment ? studentAssignment.submissions[0]?.id ?? null : null;

  const students = canManage
    ? await prisma.user.findMany({
        where: { organisationId: session.organisationId, role: UserRole.STUDENT },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Link href={`/programmes/${activity.programmeId}`} className="text-sm text-emerald-800 underline dark:text-emerald-300">
        ← {activity.programme.title}
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">{activity.title}</h1>
      <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">{activity.description}</p>
      <p className="mt-2 text-sm text-zinc-500">Due: {activity.dueDate ? activity.dueDate.toISOString() : "Not set"}</p>

      {canManage && (
        <section className="mt-8 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-medium">Assign students</h2>
          <AssignStudentForm activityId={activity.id} students={students} assignedIds={activity.assignments.map((a) => a.studentId)} />
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-medium">Assigned students</h2>
        <ul className="mt-2 text-sm">
          {activity.assignments.map((a) => (
            <li key={a.id}>
              {a.student.name}
              {session.sub === a.studentId && a.submissions[0] && (
                <Link href={`/submissions/${a.submissions[0].id}`} className="ml-2 text-emerald-800 underline dark:text-emerald-300">
                  Your submission
                </Link>
              )}
              {canManage && a.submissions[0] && (
                <Link href={`/submissions/${a.submissions[0].id}/review`} className="ml-2 text-emerald-800 underline dark:text-emerald-300">
                  Review
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>

      {session.role === UserRole.STUDENT && studentAssignment && (
        <div className="mt-6">
          {submissionId ? (
            <Link href={`/submissions/${submissionId}`} className="inline-block rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white">
              Open your submission
            </Link>
          ) : (
            <StartSubmissionButton activityId={activity.id} />
          )}
        </div>
      )}
    </main>
  );
}
