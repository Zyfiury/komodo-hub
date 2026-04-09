import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublicationState } from "@/lib/constants";

type Props = { params: Promise<{ id: string }> };

export default async function SpeciesDetailPage({ params }: Props) {
  const { id } = await params;
  const s = await prisma.species.findUnique({
    where: { id },
    include: { imageAsset: true },
  });
  if (!s || s.publicationState !== PublicationState.APPROVED) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/species" className="text-sm text-emerald-800 underline dark:text-emerald-300">
        ← Species
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">{s.name}</h1>
      {s.scientificName ? <p className="mt-1 italic text-zinc-600 dark:text-zinc-400">{s.scientificName}</p> : null}
      {s.imageAsset && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/api/files/${s.imageAsset.id}`} alt="" className="mt-6 max-h-64 rounded-lg border border-zinc-200 object-cover dark:border-zinc-800" />
      )}
      <p className="mt-6 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">{s.description}</p>
      {s.conservationNotes ? (
        <section className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900/50 dark:bg-amber-950/40">
          <h2 className="font-medium text-amber-900 dark:text-amber-200">Conservation notes</h2>
          <p className="mt-2 whitespace-pre-wrap text-amber-950 dark:text-amber-100">{s.conservationNotes}</p>
        </section>
      ) : null}
    </main>
  );
}
