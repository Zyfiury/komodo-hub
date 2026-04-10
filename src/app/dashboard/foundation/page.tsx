import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { requireRoles } from "@/lib/auth/guards";
import { UserRole, PublicationState, SightingState, CampaignStatus } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { createCampaignForm } from "@/app/actions/campaigns";
import { CampaignEditor } from "./CampaignEditor";
import { OrgRow } from "./OrgRow";

export default async function FoundationDashboardPage() {
  requireRoles(await getSession(), [UserRole.FOUNDATION_ADMIN]);

  const [orgCount, pendingLib, pendingSightings, pendingSpecies, telemetry, campaigns, orgs] = await Promise.all([
    prisma.organisation.count({ where: { NOT: { type: "FOUNDATION" } } }),
    prisma.libraryItem.count({ where: { state: PublicationState.PENDING } }),
    prisma.sightingReport.count({ where: { workflowState: SightingState.PENDING } }),
    prisma.species.count({ where: { publicationState: PublicationState.PENDING } }),
    prisma.telemetryEvent.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
    prisma.campaign.findMany({ orderBy: { updatedAt: "desc" }, take: 15 }),
    prisma.organisation.findMany({
      where: { NOT: { type: "FOUNDATION" } },
      orderBy: { name: "asc" },
      include: { subscriptions: true },
    }),
  ]);

  const byType = await prisma.telemetryEvent.groupBy({
    by: ["type"],
    _count: { id: true },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Foundation admin</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Organisations, moderation, campaigns, and service signals.</p>
        </div>
        <Link href="/moderation" className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500">
          Open moderation queue
        </Link>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs uppercase text-zinc-500">Organisations</p>
          <p className="mt-1 text-2xl font-semibold">{orgCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs uppercase text-zinc-500">Pending library</p>
          <p className="mt-1 text-2xl font-semibold">{pendingLib}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs uppercase text-zinc-500">Pending sightings</p>
          <p className="mt-1 text-2xl font-semibold">{pendingSightings}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs uppercase text-zinc-500">Pending species</p>
          <p className="mt-1 text-2xl font-semibold">{pendingSpecies}</p>
        </div>
      </section>

      <section className="mt-10 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-medium">Telemetry summaries (live)</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {byType.map((row) => (
            <li key={row.type} className="flex justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">{row.type}</span>
              <span className="font-medium">{row._count.id}</span>
            </li>
          ))}
        </ul>
        <h3 className="mt-6 text-sm font-medium text-zinc-700 dark:text-zinc-300">Recent events</h3>
        <ul className="mt-2 max-h-48 overflow-auto text-xs text-zinc-600 dark:text-zinc-400">
          {telemetry.map((e) => (
            <li key={e.id}>
              {e.createdAt.toISOString()} — {e.type}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-medium">Organisations & subscriptions</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Public profile</th>
                <th className="py-2 pr-4">Subscription</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((o) => (
                <OrgRow key={o.id} org={o} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-medium">Campaigns (CRUD)</h2>
        <form action={createCampaignForm} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm sm:col-span-2">
            Title
            <input name="title" required className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950" />
          </label>
          <label className="text-sm sm:col-span-2">
            Slug
            <input name="slug" required className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950" />
          </label>
          <label className="text-sm sm:col-span-2">
            Summary
            <input name="summary" className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950" />
          </label>
          <label className="text-sm sm:col-span-2">
            Body
            <textarea name="body" rows={3} className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isPublic" /> Public listing
          </label>
          <label className="text-sm">
            Status
            <select name="status" defaultValue={CampaignStatus.DRAFT} className="mt-1 w-full rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950">
              {Object.values(CampaignStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm font-medium text-white sm:col-span-2">
            Create campaign
          </button>
        </form>

        <ul className="mt-8 space-y-4">
          {campaigns.map((c) => (
            <CampaignEditor key={c.id} campaign={c} />
          ))}
        </ul>
      </section>
    </main>
  );
}
