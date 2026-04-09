import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { requireRoles } from "@/lib/auth/guards";
import { UserRole } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export default async function StudentDashboardPage() {
  const session = requireRoles(await getSession(), [UserRole.STUDENT]);

  const assignments = await prisma.activityAssignment.findMany({
    where: { studentId: session.sub },
    include: {
      activity: { include: { programme: true } },
      submissions: true,
    },
    orderBy: { activity: { dueDate: "asc" } },
  });

  const notes = await prisma.teacherNote.count({
    where: { submission: { studentId: session.sub } },
  });

  const sightings = await prisma.sightingReport.findMany({
    where: { reporterId: session.sub },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Student dashboard</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">Assignments, progress, and your wildlife reports (private to your school).</p>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs uppercase text-zinc-500">Assignments</p>
          <p className="text-2xl font-semibold">{assignments.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs uppercase text-zinc-500">Teacher notes</p>
          <p className="text-2xl font-semibold">{notes}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs uppercase text-zinc-500">Recent reports</p>
          <p className="text-2xl font-semibold">{sightings.length}</p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Assigned activities</h2>
        <ul className="mt-3 space-y-3 text-sm">
          {assignments.map((a) => {
            const sub = a.submissions[0];
            return (
              <li key={a.id} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="font-medium">{a.activity.title}</div>
                <div className="text-zinc-500">{a.activity.programme.title}</div>
                <div className="mt-1 text-zinc-600 dark:text-zinc-400">
                  Due: {a.activity.dueDate ? a.activity.dueDate.toISOString() : "Not set"} · Review: {sub?.reviewState ?? "No submission yet"}
                </div>
                {sub ? (
                  <Link href={`/submissions/${sub.id}`} className="mt-2 inline-block text-emerald-800 underline dark:text-emerald-300">
                    Open submission
                  </Link>
                ) : (
                  <Link href={`/activities/${a.activity.id}`} className="mt-2 inline-block text-emerald-800 underline dark:text-emerald-300">
                    Start activity
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Wildlife reports</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {sightings.map((s) => (
            <li key={s.id}>
              {s.workflowState} · {s.observedAt.toISOString()} —{" "}
              <Link href={`/report/wildlife?edit=${s.id}`} className="text-emerald-800 underline dark:text-emerald-300">
                open
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/report/wildlife" className="mt-3 inline-block text-sm font-medium text-emerald-800 underline dark:text-emerald-300">
          New or draft report
        </Link>
      </section>
    </main>
  );
}
