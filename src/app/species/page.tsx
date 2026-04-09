import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublicationState } from "@/lib/constants";

export default async function SpeciesListPage() {
  const list = await prisma.species.findMany({
    where: { publicationState: PublicationState.APPROVED },
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Species</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">Moderated species profiles approved for public learning.</p>
      <ul className="mt-8 space-y-3">
        {list.map((s) => (
          <li key={s.id}>
            <Link href={`/species/${s.id}`} className="font-medium text-emerald-800 hover:underline dark:text-emerald-300">
              {s.name}
            </Link>
            {s.scientificName ? <span className="ml-2 text-sm italic text-zinc-500">{s.scientificName}</span> : null}
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="mt-8 text-sm text-zinc-500">No approved species yet.</p>}
    </main>
  );
}
