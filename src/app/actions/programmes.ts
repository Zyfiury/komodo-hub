"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { UserRole } from "@/lib/constants";

function canManageProgrammes(role: string) {
  return role === UserRole.TEACHER || role === UserRole.SCHOOL_ADMIN;
}

export type SimpleState = { error?: string; ok?: boolean };

export async function createProgramme(_prev: SimpleState, formData: FormData): Promise<SimpleState> {
  const session = await getSession();
  if (!session || !canManageProgrammes(session.role)) return { error: "Not allowed." };
  if (session.role === UserRole.TEACHER) {
    // teachers only in school org
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (title.length < 2) return { error: "Title is required." };

  const ownerId = session.role === UserRole.TEACHER ? session.sub : String(formData.get("ownerId") ?? session.sub);
  if (session.role === UserRole.SCHOOL_ADMIN) {
    const owner = await prisma.user.findFirst({
      where: { id: ownerId, organisationId: session.organisationId, role: UserRole.TEACHER },
    });
    if (!owner) return { error: "Select a valid teacher in your school." };
  }

  await prisma.programme.create({
    data: {
      organisationId: session.organisationId,
      ownerId,
      title,
      description,
    },
  });

  revalidatePath("/dashboard/teacher");
  revalidatePath("/dashboard/school");
  return { ok: true };
}

export async function createActivity(programmeId: string, _prev: SimpleState, formData: FormData): Promise<SimpleState> {
  const session = await getSession();
  if (!session || !canManageProgrammes(session.role)) return { error: "Not allowed." };

  const programme = await prisma.programme.findFirst({
    where: { id: programmeId, organisationId: session.organisationId },
  });
  if (!programme) return { error: "Programme not found." };
  if (session.role === UserRole.TEACHER && programme.ownerId !== session.sub) {
    return { error: "You can only add activities to your own programmes." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dueRaw = String(formData.get("dueDate") ?? "").trim();
  if (title.length < 2) return { error: "Title is required." };
  let dueDate: Date | null = null;
  if (dueRaw) {
    const d = new Date(dueRaw);
    if (Number.isNaN(d.getTime())) return { error: "Invalid due date." };
    dueDate = d;
  }

  await prisma.activity.create({
    data: { programmeId, title, description, dueDate },
  });

  revalidatePath(`/programmes/${programmeId}`);
  revalidatePath("/dashboard/teacher");
  return { ok: true };
}

export async function assignActivity(activityId: string, studentId: string): Promise<SimpleState> {
  const session = await getSession();
  if (!session || !canManageProgrammes(session.role)) return { error: "Not allowed." };

  const activity = await prisma.activity.findFirst({
    where: { id: activityId, programme: { organisationId: session.organisationId } },
    include: { programme: true },
  });
  if (!activity) return { error: "Activity not found." };
  if (session.role === UserRole.TEACHER && activity.programme.ownerId !== session.sub) {
    return { error: "Not allowed." };
  }

  const student = await prisma.user.findFirst({
    where: { id: studentId, organisationId: session.organisationId, role: UserRole.STUDENT },
  });
  if (!student) return { error: "Student not found in your school." };

  await prisma.activityAssignment.upsert({
    where: { activityId_studentId: { activityId, studentId } },
    create: { activityId, studentId },
    update: {},
  });

  revalidatePath(`/activities/${activityId}`);
  revalidatePath("/dashboard/teacher");
  revalidatePath("/dashboard/student");
  return { ok: true };
}
