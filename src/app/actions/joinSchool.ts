"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { signSession, setSessionCookie } from "@/lib/auth/session";
import { OrgType, UserRole, UserStatus } from "@/lib/constants";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(4),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export type JoinSchoolState = { error?: string; fieldErrors?: Record<string, string> };

export async function joinSchoolWithCode(_prev: JoinSchoolState, formData: FormData): Promise<JoinSchoolState> {
  const raw = {
    code: String(formData.get("code") ?? "").trim(),
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? "").toLowerCase(),
    password: String(formData.get("password") ?? ""),
  };
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0];
      if (typeof k === "string" && !fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { fieldErrors };
  }

  const { code, name, email, password } = parsed.data;

  const access = await prisma.accessCode.findUnique({
    where: { code },
    include: { school: true },
  });
  if (!access) return { error: "Access code not found." };
  if (access.school.type !== OrgType.SCHOOL) return { error: "Invalid school code." };
  if (access.school.status !== "ACTIVE") return { error: "This school organisation is not active." };
  if (access.expiresAt && access.expiresAt < new Date()) return { error: "This access code has expired." };
  if (access.usedCount >= access.maxUses) return { error: "This access code has reached its usage limit." };

  const emailTaken = await prisma.user.findUnique({ where: { email } });
  if (emailTaken) return { error: "An account with this email already exists." };

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashPassword(password),
      name,
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE,
      organisationId: access.schoolOrganisationId,
    },
  });

  await prisma.accessCode.update({
    where: { id: access.id },
    data: { usedCount: { increment: 1 } },
  });

  const token = await signSession({
    sub: user.id,
    email: user.email,
    role: user.role as import("@/lib/constants").UserRoleValue,
    organisationId: user.organisationId,
  });
  await setSessionCookie(token);

  revalidatePath("/");
  redirect("/dashboard/student");
}
