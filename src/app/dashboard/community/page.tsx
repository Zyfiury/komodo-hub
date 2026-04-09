import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { requireRoles } from "@/lib/auth/guards";
import { UserRole, OrgType, PublicationState } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { LibraryDraftForm } from "./LibraryDraftForm";
import { SubmitForReviewButton } from "./SubmitForReviewButton";

export default async function CommunityDashboardPage() {
  const raw = await getSession();
  const session = requireRoles(raw, [UserRole.COMMUNITY_ADMIN, UserRole.COMMUNITY_MEMBER]);

  const org = await prisma.organisation.findUnique({ where: { id: session.organisationId } });
  if (!org || org.type !== OrgType.COMMUNITY) {
    return <p className="p-8">This dashboard is for community organisations.</p>;
  }

  const items = await prisma.libraryItem.findMany({
    where: { organisationId: org.id },
    orderBy: { updatedAt: "desc" },
    take: 30,
  });

  const recent = await prisma.sightingReport.findMany({
    where: { organisationId: org.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Community dashboard</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{org.name}</p>
      {org.publicProfile && (
        <p className="mt-2 text-sm">
          Public community page:{" "}
          <Link href={`/communities/${org.slug}`} className="font-medium text-emerald-800 underline dark:text-emerald-300">
            /communities/{org.slug}
          </Link>
        </p>
      )}

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {(["DRAFT", "PENDING", "APPROVED"] as const).map((st) => (
          <div key={st} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs uppercase text-zinc-500">{st}</p>
            <p className="text-2xl font-semibold">{items.filter((i) => i.state === st).length}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-medium">New library draft</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Submit drafts for foundation moderation before they appear publicly.</p>
        <LibraryDraftForm />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Your organisation content</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {items.map((it) => (
            <li key={it.id} className="flex flex-wrap justify-between gap-2 border-b border-zinc-100 py-2 dark:border-zinc-800">
              <span>{it.title}</span>
              <span className="text-zinc-500">
                {it.state} · {it.type}
                {it.state === PublicationState.DRAFT && (
                  <span className="ml-2 inline">
                    <SubmitForReviewButton itemId={it.id} />
                  </span>
                )}
                {it.state === PublicationState.APPROVED && it.type === "CONTRIBUTION" && (
                  <Link href={`/contributions/${it.id}`} className="ml-2 text-emerald-800 underline dark:text-emerald-300">
                    Public page
                  </Link>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Recent organisation sightings</h2>
        <ul className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {recent.map((s) => (
            <li key={s.id}>
              {s.workflowState} · {s.observedAt.toISOString()}
            </li>
          ))}
        </ul>
        <Link href="/report/wildlife" className="mt-3 inline-block text-sm font-medium text-emerald-800 underline dark:text-emerald-300">
          Report wildlife
        </Link>
      </section>
    </main>
  );
}
