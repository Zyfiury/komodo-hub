import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { OrgType, PublicationState, LibraryAudience, LibraryItemType } from "@/lib/constants";

type Props = { params: Promise<{ slug: string }> };

export default async function PublicCommunityPage({ params }: Props) {
  const { slug } = await params;
  const org = await prisma.organisation.findUnique({
    where: { slug },
  });
  if (!org || org.type !== OrgType.COMMUNITY || !org.publicProfile || org.status !== "ACTIVE") notFound();

  const contributions = await prisma.libraryItem.findMany({
    where: {
      organisationId: org.id,
      state: PublicationState.APPROVED,
      audience: LibraryAudience.PUBLIC,
      type: LibraryItemType.CONTRIBUTION,
    },
    orderBy: { updatedAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/library" className="text-sm text-emerald-800 underline dark:text-emerald-300">
        ← Public library
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">{org.name}</h1>
      <p className="mt-2 whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">{org.description}</p>
      <section className="mt-10">
        <h2 className="text-lg font-medium">Approved member contributions</h2>
        <ul className="mt-4 space-y-3">
          {contributions.map((c) => (
            <li key={c.id}>
              <Link href={`/contributions/${c.id}`} className="font-medium text-emerald-800 hover:underline dark:text-emerald-300">
                {c.title}
              </Link>
              {c.author && <span className="ml-2 text-sm text-zinc-500">· {c.author.name}</span>}
            </li>
          ))}
        </ul>
        {contributions.length === 0 && <p className="mt-4 text-sm text-zinc-500">No approved contributions yet.</p>}
      </section>
    </main>
  );
}
