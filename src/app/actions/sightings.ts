"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { UserRole, SightingState } from "@/lib/constants";

export type SimpleState = { error?: string; ok?: boolean; id?: string };

function canReport(role: string) {
  return (
    role === UserRole.STUDENT ||
    role === UserRole.COMMUNITY_MEMBER ||
    role === UserRole.COMMUNITY_ADMIN ||
    role === UserRole.TEACHER
  );
}

export async function saveSightingDraft(_prev: SimpleState, formData: FormData): Promise<SimpleState> {
  const session = await getSession();
  if (!session || !canReport(session.role)) return { error: "Not allowed." };

  const id = String(formData.get("id") ?? "").trim();
  const speciesId = String(formData.get("speciesId") ?? "").trim();
  const speciesFreeText = String(formData.get("speciesFreeText") ?? "").trim();
  const observedAt = String(formData.get("observedAt") ?? "").trim();
  const locationLabel = String(formData.get("locationLabel") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const lat = String(formData.get("latitude") ?? "").trim();
  const lng = String(formData.get("longitude") ?? "").trim();
  const mediaAssetId = String(formData.get("mediaAssetId") ?? "").trim() || null;

  const observed = observedAt ? new Date(observedAt) : new Date();
  if (Number.isNaN(observed.getTime())) return { error: "Invalid observation date." };

  const latitude = lat === "" ? null : Number(lat);
  const longitude = lng === "" ? null : Number(lng);
  if (latitude !== null && Number.isNaN(latitude)) return { error: "Invalid latitude." };
  if (longitude !== null && Number.isNaN(longitude)) return { error: "Invalid longitude." };

  if (id) {
    const existing = await prisma.sightingReport.findFirst({
      where: { id, reporterId: session.sub, organisationId: session.organisationId },
    });
    if (!existing) return { error: "Report not found." };
    if (existing.workflowState !== SightingState.DRAFT) {
      return { error: "This report can no longer be edited." };
    }

    await prisma.sightingReport.update({
      where: { id },
      data: {
        speciesId: speciesId || null,
        speciesFreeText,
        observedAt: observed,
        locationLabel,
        description,
        latitude,
        longitude,
        mediaAssetId,
        workflowState: SightingState.DRAFT,
      },
    });
    revalidatePath("/report/wildlife");
    revalidatePath(`/report/wildlife?edit=${id}`);
    return { ok: true, id };
  }

  const created = await prisma.sightingReport.create({
    data: {
      reporterId: session.sub,
      organisationId: session.organisationId,
      speciesId: speciesId || null,
      speciesFreeText,
      observedAt: observed,
      locationLabel,
      description,
      latitude,
      longitude,
      mediaAssetId,
      workflowState: SightingState.DRAFT,
    },
  });
  revalidatePath("/report/wildlife");
  return { ok: true, id: created.id };
}

export async function submitSighting(reportId: string): Promise<SimpleState> {
  const session = await getSession();
  if (!session || !canReport(session.role)) return { error: "Not allowed." };

  const existing = await prisma.sightingReport.findFirst({
    where: { id: reportId, reporterId: session.sub, organisationId: session.organisationId },
  });
  if (!existing) return { error: "Report not found." };
  if (existing.workflowState !== SightingState.DRAFT) return { error: "Only drafts can be submitted." };

  await prisma.sightingReport.update({
    where: { id: reportId },
    data: { workflowState: SightingState.PENDING },
  });

  revalidatePath("/report/wildlife");
  revalidatePath("/dashboard/student");
  revalidatePath("/dashboard/community");
  return { ok: true };
}
