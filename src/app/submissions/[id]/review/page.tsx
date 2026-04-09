import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { UserRole } from "@/lib/constants";
import { ReviewForm } from "./ReviewForm";
import { NoteForm } from "./NoteForm";

type Props = { params: Promise<{ id: string }> };

export default async function SubmissionReviewPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== UserRole.TEACHER && session.role !== UserRole.SCHOOL_ADMIN) {
    redirect("/dashboard/teacher");
  }

  const sub = await prisma.submission.findFirst({
    where: { id },
    include: {
      student: { select: { name: true } },
      assignment: { include: { activity: { include: { programme: true } } } },
      teacherNotes: { include: { teacher: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!sub || sub.assignment.activity.programme.organisationId !== session.organisationId) notFound();
  if (session.role === UserRole.TEACHER && sub.assignment.activity.programme.ownerId !== session.sub) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/dashboard/teacher" className="text-sm text-emerald-800 underline dark:text-emerald-300">
        ← Teacher dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Review submission</h1>
      <p className="text-sm text-zinc-500">
        Student: {sub.student.name} · {sub.assignment.activity.title}
      </p>
      <article className="mt-6 whitespace-pre-wrap rounded-lg border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        {sub.content || <span className="text-zinc-500">Empty submission</span>}
      </article>

      <section className="mt-6">
        <h2 className="text-sm font-medium">Teacher notes (private)</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {sub.teacherNotes.map((n) => (
            <li key={n.id} className="text-zinc-600 dark:text-zinc-400">
              <span className="font-medium">{n.teacher.name}</span> · {n.body}
            </li>
          ))}
        </ul>
      </section>

      {session.role === UserRole.TEACHER && <NoteForm submissionId={sub.id} />}

      <ReviewForm submissionId={sub.id} initialFeedback={sub.teacherFeedback} initialState={sub.reviewState} />
    </main>
  );
}
