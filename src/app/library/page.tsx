import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublicationState, LibraryAudience, OrgType } from "@/lib/constants";

export default async function PublicLibraryPage() {
  const items = await prisma.libraryItem.findMany({
    where: {
      state: PublicationState.APPROVED,
      OR: [
        { audience: LibraryAudience.PUBLIC },
        {
          audience: LibraryAudience.SCHOOL_PUBLIC,
          organisation: { publicProfile: true, type: OrgType.SCHOOL },
        },
      ],
    },
    include: { organisation: { select: { name: true, slug: true, type: true } }, author: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Public library</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Only moderated, approved items appear here. Internal or draft content stays private to organisations.
      </p>
      <ul className="mt-8 space-y-4">
        {items.map((it) => (
          <li key={it.id} className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-medium">{it.title}</h2>
              <span className="text-xs uppercase text-zinc-500">{it.type}</span>
            </div>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {it.organisation.name}
              {it.author ? ` · ${it.author.name}` : ""}
            </p>
            <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm">{it.body}</p>
            {it.type === "CONTRIBUTION" && it.audience === LibraryAudience.PUBLIC && (
              <Link href={`/contributions/${it.id}`} className="mt-3 inline-block text-sm font-medium text-emerald-800 underline dark:text-emerald-300">
                Public contribution page
              </Link>
            )}
            {it.audience === LibraryAudience.SCHOOL_PUBLIC && it.organisation.type === OrgType.SCHOOL && (
              <Link href={`/schools/${it.organisation.slug}`} className="mt-3 inline-block text-sm font-medium text-emerald-800 underline dark:text-emerald-300">
                School public page
              </Link>
            )}
          </li>
        ))}
      </ul>
      {items.length === 0 && <p className="mt-8 text-sm text-zinc-500">No approved public items yet.</p>}
    </main>
  );
}
