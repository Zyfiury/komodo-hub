import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CampaignStatus } from "@/lib/constants";

export default async function CampaignsPage() {
  const list = await prisma.campaign.findMany({
    where: { status: CampaignStatus.PUBLISHED, isPublic: true },
    orderBy: { startDate: "desc" },
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Campaigns</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">Published campaigns open to the public. Organisations can join when signed in.</p>
      <ul className="mt-8 space-y-4">
        {list.map((c) => (
          <li key={c.id} className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <Link href={`/campaigns/${c.slug}`} className="text-lg font-medium text-emerald-800 hover:underline dark:text-emerald-300">
              {c.title}
            </Link>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{c.summary}</p>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="mt-8 text-sm text-zinc-500">No public campaigns yet.</p>}
    </main>
  );
}
