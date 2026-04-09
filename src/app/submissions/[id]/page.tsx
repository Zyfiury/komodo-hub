import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { UserRole } from "@/lib/constants";
import { saveSubmission } from "@/app/actions/submissions";
import { SubmissionEditor } from "./SubmissionEditor";

type Props = { params: Promise<{ id: string }> };

export default async function SubmissionPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const sub = await prisma.submission.findFirst({
    where: { id },
    include: {
      student: { select: { id: true, name: true } },
      assignment: { include: { activity: { include: { programme: true } }, student: true } },
      teacherNotes: { include: { teacher: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!sub || sub.assignment.activity.programme.organisationId !== session.organisationId) notFound();

  const isOwnerStudent = session.role === UserRole.STUDENT && sub.studentId === session.sub;
  const isReviewer =
    session.role === UserRole.SCHOOL_ADMIN ||
    (session.role === UserRole.TEACHER && sub.assignment.activity.programme.ownerId === session.sub);

  if (!isOwnerStudent) {
    if (isReviewer) redirect(`/submissions/${id}/review`);
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/dashboard/student" className="text-sm text-emerald-800 underline dark:text-emerald-300">
        ← Student dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Submission</h1>
      <p className="text-sm text-zinc-500">
        Activity: {sub.assignment.activity.title} · State: {sub.reviewState}
      </p>
      {sub.teacherFeedback && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900/40 dark:bg-amber-950/30">
          <p className="font-medium text-amber-900 dark:text-amber-200">Teacher feedback</p>
          <p className="mt-1 whitespace-pre-wrap">{sub.teacherFeedback}</p>
        </div>
      )}
      <section className="mt-6">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Teacher notes (private)</h2>
        <ul className="mt-2 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          {sub.teacherNotes.map((n) => (
            <li key={n.id}>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">{n.teacher.name}</span> ·{" "}
              {n.createdAt.toISOString()}
              <p className="whitespace-pre-wrap">{n.body}</p>
            </li>
          ))}
        </ul>
      </section>
      <SubmissionEditor submissionId={sub.id} initialContent={sub.content} saveAction={saveSubmission} />
    </main>
  );
}
