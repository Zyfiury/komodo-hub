import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublicationState, LibraryAudience, LibraryItemType, OrgType } from "@/lib/constants";

type Props = { params: Promise<{ id: string }> };

export default async function PublicContributionPage({ params }: Props) {
  const { id } = await params;
  const item = await prisma.libraryItem.findUnique({
    where: { id },
    include: {
      organisation: true,
      author: { select: { name: true } },
      mediaAsset: true,
    },
  });
  if (
    !item ||
    item.state !== PublicationState.APPROVED ||
    item.audience !== LibraryAudience.PUBLIC ||
    item.type !== LibraryItemType.CONTRIBUTION ||
    item.organisation.type !== OrgType.COMMUNITY ||
    !item.organisation.publicProfile
  ) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Link href={`/communities/${item.organisation.slug}`} className="text-sm text-emerald-800 underline dark:text-emerald-300">
        ← {item.organisation.name}
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">{item.title}</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {item.organisation.name}
        {item.author ? ` · ${item.author.name}` : ""}
      </p>
      {item.mediaAsset && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/api/files/${item.mediaAsset.id}`} alt="" className="mt-6 max-h-72 rounded-lg border object-cover" />
      )}
      <article className="prose prose-zinc mt-8 max-w-none whitespace-pre-wrap dark:prose-invert">{item.body}</article>
    </main>
  );
}
