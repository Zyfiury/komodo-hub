"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { UserRole } from "@/lib/constants";
import crypto from "crypto";

export type CodeActionState = { ok?: boolean; error?: string; code?: string };

export async function createSchoolAccessCode(_prev: CodeActionState, formData: FormData): Promise<CodeActionState> {
  const session = await getSession();
  if (!session || session.role !== UserRole.SCHOOL_ADMIN) {
    return { error: "Only school administrators can create access codes." };
  }

  const maxUses = Math.min(500, Math.max(1, Number(formData.get("maxUses") ?? 50)));
  const expiresRaw = String(formData.get("expiresAt") ?? "").trim();
  let expiresAt: Date | null = null;
  if (expiresRaw) {
    const d = new Date(expiresRaw);
    if (Number.isNaN(d.getTime())) return { error: "Invalid expiry date." };
    expiresAt = d;
  }

  const code = `KH-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

  await prisma.accessCode.create({
    data: {
      code,
      schoolOrganisationId: session.organisationId,
      createdById: session.sub,
      maxUses,
      expiresAt,
    },
  });

  revalidatePath("/dashboard/school");
  return { ok: true, code };
}
