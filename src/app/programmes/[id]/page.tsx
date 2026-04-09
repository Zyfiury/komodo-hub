import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { UserRole } from "@/lib/constants";
import { ActivityCreateForm } from "./ActivityCreateForm";

type Props = { params: Promise<{ id: string }> };

async function canViewProgramme(session: NonNullable<Awaited<ReturnType<typeof getSession>>>, programmeId: string) {
  const programme = await prisma.programme.findFirst({
    where: { id: programmeId, organisationId: session.organisationId },
    include: {
      activities: { orderBy: { createdAt: "asc" }, include: { assignments: true } },
    },
  });
  if (!programme) return null;
  if (session.role === UserRole.SCHOOL_ADMIN) return programme;
  if (session.role === UserRole.TEACHER && programme.ownerId === session.sub) return programme;
  if (session.role === UserRole.STUDENT) {
    const ok = programme.activities.some((a) => a.assignments.some((as) => as.studentId === session.sub));
    if (ok) return programme;
  }
  return null;
}

export default async function ProgrammePage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const programme = await canViewProgramme(session, id);
  if (!programme) notFound();

  const canManage =
    session.role === UserRole.SCHOOL_ADMIN || (session.role === UserRole.TEACHER && programme.ownerId === session.sub);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Link href={session.role === UserRole.SCHOOL_ADMIN ? "/dashboard/school" : "/dashboard/teacher"} className="text-sm text-emerald-800 underline dark:text-emerald-300">
        ← Dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">{programme.title}</h1>
      <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">{programme.description}</p>

      {canManage && <ActivityCreateForm programmeId={programme.id} />}

      <section className="mt-8">
        <h2 className="text-lg font-medium">Activities</h2>
        <ul className="mt-3 space-y-2">
          {programme.activities.map((a) => (
            <li key={a.id}>
              <Link href={`/activities/${a.id}`} className="font-medium text-emerald-800 hover:underline dark:text-emerald-300">
                {a.title}
              </Link>
              <span className="ml-2 text-sm text-zinc-500">
                Due {a.dueDate ? a.dueDate.toISOString() : "—"} · {a.assignments.length} assigned
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
