"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { signSession } from "@/lib/auth/session";
import { setSessionCookie } from "@/lib/auth/session";
import { OrgType, OrgStatus, UserRole, UserStatus } from "@/lib/constants";
import { z } from "zod";

const schema = z.object({
  orgName: z.string().min(2),
  orgSlug: z.string().min(2).max(64).regex(/^[a-z0-9-]+$/),
  description: z.string().max(2000).optional(),
  orgKind: z.enum(["SCHOOL", "COMMUNITY"]),
  adminName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export type RegisterState = { error?: string; fieldErrors?: Record<string, string> };

export async function registerOrganisation(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const raw = {
    orgName: String(formData.get("orgName") ?? ""),
    orgSlug: String(formData.get("orgSlug") ?? "").toLowerCase(),
    description: String(formData.get("description") ?? ""),
    orgKind: String(formData.get("orgKind") ?? ""),
    adminName: String(formData.get("adminName") ?? ""),
    email: String(formData.get("email") ?? "").toLowerCase(),
    password: String(formData.get("password") ?? ""),
  };
  const parsed = schema.safeParse({
    ...raw,
    orgKind: raw.orgKind === "COMMUNITY" ? "COMMUNITY" : "SCHOOL",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0];
      if (typeof k === "string" && !fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { fieldErrors };
  }

  const { orgName, orgSlug, description, orgKind, adminName, email, password } = parsed.data;

  const exists = await prisma.organisation.findUnique({ where: { slug: orgSlug } });
  if (exists) return { error: "That organisation URL is already taken. Choose another slug." };

  const emailTaken = await prisma.user.findUnique({ where: { email } });
  if (emailTaken) return { error: "An account with this email already exists." };

  const type = orgKind === "SCHOOL" ? OrgType.SCHOOL : OrgType.COMMUNITY;
  const role = orgKind === "SCHOOL" ? UserRole.SCHOOL_ADMIN : UserRole.COMMUNITY_ADMIN;

  const org = await prisma.organisation.create({
    data: {
      name: orgName,
      slug: orgSlug,
      type,
      status: OrgStatus.ACTIVE,
      publicProfile: false,
      description: description ?? "",
    },
  });

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashPassword(password),
      name: adminName,
      role,
      status: UserStatus.ACTIVE,
      organisationId: org.id,
    },
  });

  await prisma.subscription.create({
    data: {
      organisationId: org.id,
      status: "TRIAL",
      planLabel: orgKind === "SCHOOL" ? "school_trial" : "community_trial",
    },
  });

  const token = await signSession({
    sub: user.id,
    email: user.email,
    role: user.role as import("@/lib/constants").UserRoleValue,
    organisationId: user.organisationId,
  });
  await setSessionCookie(token);

  revalidatePath("/");
  redirect(orgKind === "SCHOOL" ? "/dashboard/school" : "/dashboard/community");
}
