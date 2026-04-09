import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { UserRole, PublicationState, LibraryAudience } from "@/lib/constants";

type Params = { params: Promise<{ id: string }> };

async function isPublicAsset(mediaId: string): Promise<boolean> {
  const lib = await prisma.libraryItem.findFirst({
    where: {
      mediaAssetId: mediaId,
      state: PublicationState.APPROVED,
      audience: { in: [LibraryAudience.PUBLIC, LibraryAudience.SCHOOL_PUBLIC] },
    },
  });
  if (lib) return true;

  const sp = await prisma.species.findFirst({
    where: { imageAssetId: mediaId, publicationState: PublicationState.APPROVED },
  });
  return Boolean(sp);
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const session = await getSession();

  const uploaderOrg = await prisma.user.findUnique({
    where: { id: asset.uploadedById },
    select: { organisationId: true },
  });

  let allowed = false;
  if (session) {
    if (session.sub === asset.uploadedById) allowed = true;
    if (uploaderOrg && session.organisationId === uploaderOrg.organisationId) allowed = true;
    if (session.role === UserRole.FOUNDATION_ADMIN) allowed = true;
  }

  if (!allowed && (await isPublicAsset(id))) allowed = true;

  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const disk = path.join(process.cwd(), "storage", "uploads", asset.storedPath);
  try {
    const buf = await readFile(disk);
    return new NextResponse(buf, {
      headers: {
        "Content-Type": asset.mimeType,
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return NextResponse.json({ error: "Missing file" }, { status: 404 });
  }
}
