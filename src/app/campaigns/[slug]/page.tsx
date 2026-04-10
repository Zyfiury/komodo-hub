import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CampaignStatus } from "@/lib/constants";
import { getSession } from "@/lib/auth/session";
import { JoinCampaignClient } from "./JoinCampaignClient";

type Props = { params: Promise<{ slug: string }> };

export default async function CampaignDetailPage({ params }: Props) {
  const { slug } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    include: { participants: { include: { organisation: { select: { name: true, slug: true } } } } },
  });
  if (!campaign || campaign.status !== CampaignStatus.PUBLISHED || !campaign.isPublic) notFound();

  const session = await getSession();
  let already = false;
  if (session) {
    already = campaign.participants.some((p) => p.organisationId === session.organisationId);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/campaigns" className="text-sm text-emerald-800 underline dark:text-emerald-300">
        ← Campaigns
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">{campaign.title}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{campaign.summary}</p>
      <article className="prose prose-zinc mt-8 max-w-none whitespace-pre-wrap dark:prose-invert">{campaign.body}</article>

      <section className="mt-10 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-medium">Participating organisations</h2>
        <ul className="mt-3 list-inside list-disc text-sm text-zinc-600 dark:text-zinc-400">
          {campaign.participants.map((p) => (
            <li key={p.id}>{p.organisation.name}</li>
          ))}
        </ul>
        {session ? (
          already ? (
            <p className="mt-4 text-sm text-emerald-800 dark:text-emerald-300">Your organisation is already participating.</p>
          ) : (
            <JoinCampaignClient campaignId={campaign.id} />
          )
        ) : (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            <Link href="/login" className="font-medium text-emerald-800 underline dark:text-emerald-300">
              Log in
            </Link>{" "}
            as a school or community user to join this campaign.
          </p>
        )}
      </section>
    </main>
  );
}
