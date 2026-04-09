"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { UserRole, OrgType } from "@/lib/constants";

export type SimpleState = { error?: string; ok?: boolean };

export async function sendOrganisationMessage(_prev: SimpleState, formData: FormData): Promise<SimpleState> {
  const session = await getSession();
  if (!session) return { error: "Not allowed." };

  const toUserId = String(formData.get("toUserId") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!toUserId || body.length < 1) return { error: "Recipient and message are required." };

  const org = await prisma.organisation.findUnique({ where: { id: session.organisationId } });
  if (!org) return { error: "Organisation not found." };

  const recipient = await prisma.user.findFirst({
    where: { id: toUserId, organisationId: session.organisationId, status: "ACTIVE" },
  });
  if (!recipient) return { error: "Recipient not found in your organisation." };

  if (org.type === OrgType.SCHOOL) {
    const isStudent = session.role === UserRole.STUDENT;
    const isTeacher = session.role === UserRole.TEACHER;
    const isSchoolAdmin = session.role === UserRole.SCHOOL_ADMIN;
    const rStudent = recipient.role === UserRole.STUDENT;
    const rTeacher = recipient.role === UserRole.TEACHER;
    const rAdmin = recipient.role === UserRole.SCHOOL_ADMIN;

    if (isStudent) {
      if (!rTeacher && !rAdmin) return { error: "Students may message teachers or school admins only." };
    } else if (isTeacher) {
      if (!rStudent && !rAdmin) return { error: "Teachers may message students or school admins only." };
    } else if (isSchoolAdmin) {
      if (!rStudent && !rTeacher && !rAdmin) return { error: "Invalid recipient role for school messaging." };
    } else {
      return { error: "Your role cannot use school messaging." };
    }
  } else if (org.type === OrgType.COMMUNITY) {
    const ok = new Set<string>([UserRole.COMMUNITY_ADMIN, UserRole.COMMUNITY_MEMBER]);
    if (!ok.has(session.role) || !ok.has(recipient.role)) {
      return { error: "Community messaging is limited to community admins and members." };
    }
  } else {
    return { error: "Messaging is not enabled for this organisation type." };
  }

  await prisma.message.create({
    data: {
      organisationId: session.organisationId,
      fromUserId: session.sub,
      toUserId: recipient.id,
      body,
    },
  });

  revalidatePath("/messages");
  return { ok: true };
}
