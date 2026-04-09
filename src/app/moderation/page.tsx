import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { UserRole, PublicationState, SightingState } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { moderateLibraryFromForm, moderateSightingFromForm, moderateSpeciesFromForm } from "@/app/actions/moderation";

export default async function ModerationPage() {
  const session = await getSession();
  if (!session || session.role !== UserRole.FOUNDATION_ADMIN) redirect("/dashboard/foundation");

  const [library, sightings, species] = await Promise.all([
    prisma.libraryItem.findMany({
      where: { state: PublicationState.PENDING },
      include: { organisation: true, author: { select: { name: true, email: true } } },
      orderBy: { createdAt: "asc" },
      take: 40,
    }),
    prisma.sightingReport.findMany({
      where: { workflowState: SightingState.PENDING },
      include: { organisation: true, reporter: { select: { name: true } }, species: true },
      orderBy: { createdAt: "asc" },
      take: 40,
    }),
    prisma.species.findMany({
      where: { publicationState: PublicationState.PENDING },
      orderBy: { createdAt: "asc" },
      take: 40,
    }),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Moderation queue</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">Pending items only. Actions are audited.</p>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Library</h2>
        <ul className="mt-4 space-y-4">
          {library.map((it) => (
            <li key={it.id} className="rounded-xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="font-medium">{it.title}</p>
              <p className="text-zinc-500">
                {it.organisation.name} · {it.type} · {it.audience}
              </p>
              <p className="mt-2 whitespace-pre-wrap">{it.body}</p>
              <form action={moderateLibraryFromForm} className="mt-3 flex flex-wrap items-end gap-2">
                <input type="hidden" name="id" value={it.id} />
                <label className="text-xs">
                  Decision
                  <select name="state" className="ml-1 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950">
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="FLAGGED">FLAGGED</option>
                  </select>
                </label>
                <label className="flex-1 text-xs">
                  Note
                  <input name="note" className="ml-1 w-full min-w-[12rem] rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950" />
                </label>
                <button type="submit" className="rounded bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white">
                  Apply
                </button>
              </form>
            </li>
          ))}
        </ul>
        {library.length === 0 && <p className="mt-2 text-sm text-zinc-500">No pending library items.</p>}
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-medium">Sightings</h2>
        <ul className="mt-4 space-y-4">
          {sightings.map((s) => (
            <li key={s.id} className="rounded-xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="font-medium">{(s.species?.name ?? s.speciesFreeText) || "Species"}</p>
              <p className="text-zinc-500">
                {s.organisation.name} · {s.reporter.name} · {s.observedAt.toISOString()}
              </p>
              <p className="mt-2 whitespace-pre-wrap">{s.description}</p>
              <form action={moderateSightingFromForm} className="mt-3 flex flex-wrap items-end gap-2">
                <input type="hidden" name="id" value={s.id} />
                <label className="text-xs">
                  Decision
                  <select name="state" className="ml-1 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950">
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </label>
                <label className="flex-1 text-xs">
                  Note
                  <input name="note" className="ml-1 w-full min-w-[12rem] rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950" />
                </label>
                <button type="submit" className="rounded bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white">
                  Apply
                </button>
              </form>
            </li>
          ))}
        </ul>
        {sightings.length === 0 && <p className="mt-2 text-sm text-zinc-500">No pending sightings.</p>}
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-medium">Species</h2>
        <ul className="mt-4 space-y-4">
          {species.map((sp) => (
            <li key={sp.id} className="rounded-xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="font-medium">
                {sp.name} <span className="italic text-zinc-500">{sp.scientificName}</span>
              </p>
              <p className="mt-2 whitespace-pre-wrap">{sp.description}</p>
              <form action={moderateSpeciesFromForm} className="mt-3 flex flex-wrap items-end gap-2">
                <input type="hidden" name="id" value={sp.id} />
                <label className="text-xs">
                  Decision
                  <select name="state" className="ml-1 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950">
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="FLAGGED">FLAGGED</option>
                  </select>
                </label>
                <label className="flex-1 text-xs">
                  Note
                  <input name="note" className="ml-1 w-full min-w-[12rem] rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950" />
                </label>
                <button type="submit" className="rounded bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white">
                  Apply
                </button>
              </form>
            </li>
          ))}
        </ul>
        {species.length === 0 && <p className="mt-2 text-sm text-zinc-500">No pending species.</p>}
      </section>
    </main>
  );
}
