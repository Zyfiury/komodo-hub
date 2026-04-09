"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { UserRole, OrgStatus } from "@/lib/constants";
import { audit } from "@/lib/audit";

export type SimpleState = { error?: string; ok?: boolean };

export async function setOrganisationStatus(organisationId: string, status: string): Promise<SimpleState> {
  const session = await getSession();
  if (!session || session.role !== UserRole.FOUNDATION_ADMIN) return { error: "Not allowed." };

  const allowed = new Set(Object.values(OrgStatus));
  if (!allowed.has(status as (typeof OrgStatus)[keyof typeof OrgStatus])) return { error: "Invalid status." };

  const org = await prisma.organisation.findUnique({ where: { id: organisationId } });
  if (!org) return { error: "Organisation not found." };
  if (org.type === "FOUNDATION") return { error: "Cannot change foundation organisation status here." };

  await prisma.organisation.update({
    where: { id: organisationId },
    data: { status },
  });

  await audit(session.sub, "organisation.status", "Organisation", organisationId, { status });
  revalidatePath("/dashboard/foundation");
  return { ok: true };
}

export async function setOrganisationPublicProfile(organisationId: string, publicProfile: boolean): Promise<SimpleState> {
  const session = await getSession();
  if (!session || session.role !== UserRole.FOUNDATION_ADMIN) return { error: "Not allowed." };

  await prisma.organisation.update({
    where: { id: organisationId },
    data: { publicProfile },
  });

  await audit(session.sub, "organisation.publicProfile", "Organisation", organisationId, { publicProfile });
  revalidatePath("/dashboard/foundation");
  revalidatePath("/schools");
  revalidatePath("/communities");
  return { ok: true };
}
