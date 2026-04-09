"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { UserRole, PublicationState, LibraryItemType, LibraryAudience } from "@/lib/constants";

export type SimpleState = { error?: string; ok?: boolean; id?: string };

export async function createLibraryDraft(_prev: SimpleState, formData: FormData): Promise<SimpleState> {
  const session = await getSession();
  if (!session) return { error: "Not allowed." };

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const type = String(formData.get("type") ?? LibraryItemType.ARTICLE);
  const audience = String(formData.get("audience") ?? LibraryAudience.PUBLIC);

  const types = new Set(Object.values(LibraryItemType));
  const auds = new Set(Object.values(LibraryAudience));
  if (!types.has(type as (typeof LibraryItemType)[keyof typeof LibraryItemType])) return { error: "Invalid type." };
  if (!auds.has(audience as (typeof LibraryAudience)[keyof typeof LibraryAudience])) return { error: "Invalid audience." };

  if (title.length < 2) return { error: "Title is required." };

  if (session.role === UserRole.STUDENT) {
    return { error: "Students publish through assignments and sightings, not the library composer." };
  }

  const item = await prisma.libraryItem.create({
    data: {
      organisationId: session.organisationId,
      authorId: session.sub,
      type,
      title,
      body,
      audience,
      state: PublicationState.DRAFT,
    },
  });

  revalidatePath("/dashboard/community");
  revalidatePath("/dashboard/school");
  revalidatePath("/dashboard/teacher");
  return { ok: true, id: item.id };
}

export async function submitLibraryForReview(itemId: string): Promise<SimpleState> {
  const session = await getSession();
  if (!session) return { error: "Not allowed." };

  const item = await prisma.libraryItem.findFirst({
    where: { id: itemId, organisationId: session.organisationId },
  });
  if (!item) return { error: "Not found." };
  if (item.authorId && item.authorId !== session.sub && session.role !== UserRole.SCHOOL_ADMIN && session.role !== UserRole.COMMUNITY_ADMIN) {
    return { error: "Not allowed." };
  }
  if (item.state !== PublicationState.DRAFT) return { error: "Only drafts can be submitted." };

  await prisma.libraryItem.update({
    where: { id: itemId },
    data: { state: PublicationState.PENDING },
  });

  revalidatePath("/moderation");
  revalidatePath("/dashboard/community");
  return { ok: true };
}
