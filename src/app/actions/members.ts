"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { UserRole, UserStatus } from "@/lib/constants";

export async function setMemberStatus(userId: string, status: string): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== UserRole.SCHOOL_ADMIN) return;

  const allowed = new Set<string>([UserStatus.ACTIVE, UserStatus.INACTIVE]);
  if (!allowed.has(status)) return;

  const target = await prisma.user.findFirst({
    where: { id: userId, organisationId: session.organisationId },
  });
  if (!target || target.role === UserRole.SCHOOL_ADMIN) return;

  await prisma.user.update({
    where: { id: userId },
    data: { status },
  });

  revalidatePath("/dashboard/school");
}
