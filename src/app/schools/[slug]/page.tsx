import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { OrgType, PublicationState, LibraryAudience } from "@/lib/constants";

type Props = { params: Promise<{ slug: string }> };

export default async function PublicSchoolPage({ params }: Props) {
  const { slug } = await params;
  const org = await prisma.organisation.findUnique({
    where: { slug },
  });
  if (!org || org.type !== OrgType.SCHOOL || !org.publicProfile || org.status !== "ACTIVE") notFound();

  const library = await prisma.libraryItem.findMany({
    where: {
      organisationId: org.id,
      state: PublicationState.APPROVED,
      audience: LibraryAudience.SCHOOL_PUBLIC,
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
        <h2 className="text-lg font-medium">Approved school library highlights</h2>
        <ul className="mt-4 space-y-4">
          {library.map((it) => (
            <li key={it.id} className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="font-medium">{it.title}</h3>
              {it.author && <p className="text-xs text-zinc-500">{it.author.name}</p>}
              <p className="mt-2 line-clamp-6 whitespace-pre-wrap text-sm">{it.body}</p>
            </li>
          ))}
        </ul>
        {library.length === 0 && <p className="mt-4 text-sm text-zinc-500">No public school library items yet.</p>}
      </section>
    </main>
  );
}
