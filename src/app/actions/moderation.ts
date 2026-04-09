"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { UserRole, PublicationState, SightingState } from "@/lib/constants";
import { audit } from "@/lib/audit";

export type SimpleState = { error?: string; ok?: boolean };

function requireFoundation(session: Awaited<ReturnType<typeof getSession>>) {
  if (!session || session.role !== UserRole.FOUNDATION_ADMIN) return false;
  return true;
}

export async function moderateLibraryFromForm(formData: FormData): Promise<void> {
  const itemId = String(formData.get("id") ?? "").trim();
  const nextState = String(formData.get("state") ?? "").trim();
  const reviewNote = String(formData.get("note") ?? "").trim();
  await moderateLibraryItem(itemId, nextState, reviewNote);
}

export async function moderateSightingFromForm(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  const nextState = String(formData.get("state") ?? "").trim();
  const reviewNote = String(formData.get("note") ?? "").trim();
  await moderateSighting(id, nextState, reviewNote);
}

export async function moderateSpeciesFromForm(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  const nextState = String(formData.get("state") ?? "").trim();
  const reviewNote = String(formData.get("note") ?? "").trim();
  await moderateSpecies(id, nextState, reviewNote);
}

export async function moderateLibraryItem(itemId: string, nextState: string, reviewNote: string): Promise<SimpleState> {
  const session = await getSession();
  if (!requireFoundation(session)) return { error: "Not allowed." };

  const allowed = new Set<string>([
    PublicationState.APPROVED,
    PublicationState.REJECTED,
    PublicationState.FLAGGED,
    PublicationState.PENDING,
  ]);
  if (!allowed.has(nextState)) return { error: "Invalid state." };

  const item = await prisma.libraryItem.findUnique({ where: { id: itemId } });
  if (!item) return { error: "Not found." };

  await prisma.libraryItem.update({
    where: { id: itemId },
    data: {
      state: nextState,
      reviewedById: session!.sub,
      reviewedAt: new Date(),
      reviewReason: reviewNote,
    },
  });

  await audit(session!.sub, "library.moderate", "LibraryItem", itemId, { nextState, reviewNote });
  revalidatePath("/moderation");
  revalidatePath("/library");
  revalidatePath(`/contributions/${itemId}`);
  return { ok: true };
}

export async function moderateSighting(reportId: string, nextState: string, reviewNote: string): Promise<SimpleState> {
  const session = await getSession();
  if (!requireFoundation(session)) return { error: "Not allowed." };

  const allowed = new Set<string>([SightingState.APPROVED, SightingState.REJECTED, SightingState.PENDING]);
  if (!allowed.has(nextState)) return { error: "Invalid state." };

  const row = await prisma.sightingReport.findUnique({ where: { id: reportId } });
  if (!row) return { error: "Not found." };

  await prisma.sightingReport.update({
    where: { id: reportId },
    data: {
      workflowState: nextState,
      reviewedById: session!.sub,
      reviewedAt: new Date(),
      reviewNote,
    },
  });

  await audit(session!.sub, "sighting.moderate", "SightingReport", reportId, { nextState, reviewNote });
  revalidatePath("/moderation");
  return { ok: true };
}

export async function moderateSpecies(speciesId: string, nextState: string, reviewNote: string): Promise<SimpleState> {
  const session = await getSession();
  if (!requireFoundation(session)) return { error: "Not allowed." };

  const allowed = new Set<string>([
    PublicationState.APPROVED,
    PublicationState.REJECTED,
    PublicationState.PENDING,
    PublicationState.FLAGGED,
  ]);
  if (!allowed.has(nextState)) return { error: "Invalid state." };

  await prisma.species.update({
    where: { id: speciesId },
    data: {
      publicationState: nextState,
      reviewedById: session!.sub,
      reviewedAt: new Date(),
      reviewReason: reviewNote,
    },
  });

  await audit(session!.sub, "species.moderate", "Species", speciesId, { nextState, reviewNote });
  revalidatePath("/moderation");
  revalidatePath("/species");
  revalidatePath(`/species/${speciesId}`);
  return { ok: true };
}
