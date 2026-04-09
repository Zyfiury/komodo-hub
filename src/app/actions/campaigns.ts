"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import {
  UserRole,
  OrgType,
  CampaignStatus,
} from "@/lib/constants";
import { audit } from "@/lib/audit";

export type SimpleState = { error?: string; ok?: boolean };

export async function joinCampaignFromForm(_prev: SimpleState, formData: FormData): Promise<SimpleState> {
  const campaignId = String(formData.get("campaignId") ?? "").trim();
  if (!campaignId) return { error: "Missing campaign." };
  return joinCampaign(campaignId);
}

export async function joinCampaign(campaignId: string): Promise<SimpleState> {
  const session = await getSession();
  if (!session) return { error: "Not allowed." };

  const org = await prisma.organisation.findUnique({ where: { id: session.organisationId } });
  if (!org || (org.type !== OrgType.SCHOOL && org.type !== OrgType.COMMUNITY)) {
    return { error: "Only school or community organisations can join campaigns." };
  }

  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign || campaign.status !== CampaignStatus.PUBLISHED || !campaign.isPublic) {
    return { error: "Campaign is not available to join." };
  }

  await prisma.campaignParticipation.upsert({
    where: {
      campaignId_organisationId: { campaignId, organisationId: session.organisationId },
    },
    create: { campaignId, organisationId: session.organisationId },
    update: {},
  });

  revalidatePath(`/campaigns/${campaign.slug}`);
  revalidatePath("/dashboard/teacher");
  revalidatePath("/dashboard/community");
  revalidatePath("/dashboard/school");
  return { ok: true };
}

export async function createCampaignForm(formData: FormData): Promise<void> {
  await createCampaign({}, formData);
}

export async function createCampaign(_prev: SimpleState, formData: FormData): Promise<SimpleState> {
  const session = await getSession();
  if (!session || session.role !== UserRole.FOUNDATION_ADMIN) return { error: "Not allowed." };

  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
  const summary = String(formData.get("summary") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const isPublic = String(formData.get("isPublic") ?? "") === "on";
  const status = String(formData.get("status") ?? CampaignStatus.DRAFT);

  if (title.length < 2 || slug.length < 2) return { error: "Title and slug are required." };
  const statuses = new Set(Object.values(CampaignStatus));
  if (!statuses.has(status as (typeof CampaignStatus)[keyof typeof CampaignStatus])) return { error: "Invalid status." };

  const exists = await prisma.campaign.findUnique({ where: { slug } });
  if (exists) return { error: "Slug already in use." };

  const c = await prisma.campaign.create({
    data: {
      title,
      slug,
      summary,
      body,
      status,
      isPublic,
      createdById: session.sub,
    },
  });

  await audit(session.sub, "campaign.create", "Campaign", c.id, { slug, status });
  revalidatePath("/campaigns");
  revalidatePath("/dashboard/foundation");
  return { ok: true };
}

export async function updateCampaign(campaignId: string, _prev: SimpleState, formData: FormData): Promise<SimpleState> {
  const session = await getSession();
  if (!session || session.role !== UserRole.FOUNDATION_ADMIN) return { error: "Not allowed." };

  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const isPublic = String(formData.get("isPublic") ?? "") === "on";
  const status = String(formData.get("status") ?? CampaignStatus.DRAFT);

  if (title.length < 2) return { error: "Title is required." };
  const statuses = new Set(Object.values(CampaignStatus));
  if (!statuses.has(status as (typeof CampaignStatus)[keyof typeof CampaignStatus])) return { error: "Invalid status." };

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { title, summary, body, isPublic, status },
  });

  await audit(session.sub, "campaign.update", "Campaign", campaignId, { status });
  revalidatePath("/campaigns");
  revalidatePath("/dashboard/foundation");
  return { ok: true };
}
