"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { UserRole, SubmissionReviewState } from "@/lib/constants";

export type SimpleState = { error?: string; ok?: boolean };

export async function ensureSubmissionForActivity(activityId: string): Promise<string | null> {
  const session = await getSession();
  if (!session || session.role !== UserRole.STUDENT) return null;

  const assignment = await prisma.activityAssignment.findFirst({
    where: { activityId, studentId: session.sub },
    include: { submissions: true, activity: { include: { programme: true } } },
  });
  if (!assignment || assignment.activity.programme.organisationId !== session.organisationId) return null;

  if (assignment.submissions[0]) return assignment.submissions[0].id;

  const sub = await prisma.submission.create({
    data: { assignmentId: assignment.id, studentId: session.sub },
  });
  revalidatePath(`/activities/${activityId}`);
  revalidatePath("/dashboard/student");
  return sub.id;
}

export async function saveSubmission(submissionId: string, _prev: SimpleState, formData: FormData): Promise<SimpleState> {
  const session = await getSession();
  if (!session || session.role !== UserRole.STUDENT) return { error: "Not allowed." };

  const sub = await prisma.submission.findFirst({
    where: { id: submissionId, studentId: session.sub },
    include: { assignment: { include: { activity: { include: { programme: true } } } } },
  });
  if (!sub || sub.assignment.activity.programme.organisationId !== session.organisationId) {
    return { error: "Submission not found." };
  }

  const content = String(formData.get("content") ?? "").trim();
  await prisma.submission.update({
    where: { id: submissionId },
    data: { content },
  });

  revalidatePath(`/submissions/${submissionId}`);
  revalidatePath("/dashboard/student");
  return { ok: true };
}

export async function reviewSubmission(submissionId: string, _prev: SimpleState, formData: FormData): Promise<SimpleState> {
  const session = await getSession();
  if (!session || (session.role !== UserRole.TEACHER && session.role !== UserRole.SCHOOL_ADMIN)) {
    return { error: "Not allowed." };
  }

  const sub = await prisma.submission.findFirst({
    where: { id: submissionId },
    include: { assignment: { include: { activity: { include: { programme: true } } } } },
  });
  if (!sub || sub.assignment.activity.programme.organisationId !== session.organisationId) {
    return { error: "Not found." };
  }
  if (session.role === UserRole.TEACHER && sub.assignment.activity.programme.ownerId !== session.sub) {
    return { error: "Not allowed." };
  }

  const teacherFeedback = String(formData.get("teacherFeedback") ?? "").trim();
  const reviewState = String(formData.get("reviewState") ?? SubmissionReviewState.REVIEWED);
  const allowed = new Set<string>(Object.values(SubmissionReviewState));
  if (!allowed.has(reviewState)) return { error: "Invalid review state." };

  await prisma.submission.update({
    where: { id: submissionId },
    data: { teacherFeedback, reviewState },
  });

  revalidatePath(`/submissions/${submissionId}`);
  revalidatePath("/dashboard/teacher");
  return { ok: true };
}

export async function addTeacherNote(submissionId: string, _prev: SimpleState, formData: FormData): Promise<SimpleState> {
  const session = await getSession();
  if (!session || session.role !== UserRole.TEACHER) return { error: "Only teachers can add notes." };

  const sub = await prisma.submission.findFirst({
    where: { id: submissionId },
    include: { assignment: { include: { activity: { include: { programme: true } } } } },
  });
  if (!sub || sub.assignment.activity.programme.organisationId !== session.organisationId) {
    return { error: "Not found." };
  }
  if (sub.assignment.activity.programme.ownerId !== session.sub) return { error: "Not allowed." };

  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 1) return { error: "Note cannot be empty." };

  await prisma.teacherNote.create({
    data: { submissionId, teacherId: session.sub, body },
  });

  revalidatePath(`/submissions/${submissionId}`);
  return { ok: true };
}
