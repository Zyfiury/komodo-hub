import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { requireRoles } from "@/lib/auth/guards";
import { UserRole } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { ProgrammeCreateForm } from "./ProgrammeCreateForm";

export default async function TeacherDashboardPage() {
  const session = requireRoles(await getSession(), [UserRole.TEACHER]);
  const now = new Date();
  const inTwoWeeks = new Date(now);
  inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);

  const [programmes, students, dueSoon, recentSubs] = await Promise.all([
    prisma.programme.findMany({
      where: { organisationId: session.organisationId, ownerId: session.sub },
      include: { activities: { include: { assignments: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.user.count({ where: { organisationId: session.organisationId, role: UserRole.STUDENT } }),
    prisma.activity.findMany({
      where: {
        programme: { organisationId: session.organisationId, ownerId: session.sub },
        dueDate: { gte: now, lte: inTwoWeeks },
      },
      include: { programme: true },
      take: 8,
    }),
    prisma.submission.findMany({
      where: {
        assignment: { activity: { programme: { ownerId: session.sub, organisationId: session.organisationId } } },
      },
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: {
        student: { select: { name: true } },
        assignment: { include: { activity: true } },
      },
    }),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Teacher dashboard</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">Programmes, assignments, and submissions in your school.</p>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs uppercase text-zinc-500">Your programmes</p>
          <p className="text-2xl font-semibold">{programmes.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs uppercase text-zinc-500">Students in school</p>
          <p className="text-2xl font-semibold">{students}</p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Programmes</h2>
        <ul className="mt-3 space-y-2">
          {programmes.map((p) => (
            <li key={p.id}>
              <Link href={`/programmes/${p.id}`} className="font-medium text-emerald-800 hover:underline dark:text-emerald-300">
                {p.title}
              </Link>
              <span className="ml-2 text-sm text-zinc-500">{p.activities.length} activities</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Tasks due in the next two weeks</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {dueSoon.map((a) => (
            <li key={a.id}>
              <Link href={`/activities/${a.id}`} className="text-emerald-800 underline dark:text-emerald-300">
                {a.title}
              </Link>
              <span className="text-zinc-500"> · {a.dueDate?.toISOString() ?? "No due date"}</span>
            </li>
          ))}
        </ul>
        {dueSoon.length === 0 && <p className="text-sm text-zinc-500">No upcoming due dates.</p>}
      </section>

      <ProgrammeCreateForm />

      <section className="mt-10">
        <h2 className="text-lg font-medium">Recent submissions</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {recentSubs.map((s) => (
            <li key={s.id}>
              <Link href={`/submissions/${s.id}/review`} className="text-emerald-800 underline dark:text-emerald-300">
                Review
              </Link>
              <span className="ml-2">
                {s.student.name} — {s.assignment.activity.title} ({s.reviewState})
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
