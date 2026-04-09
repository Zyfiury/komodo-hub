import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { PublicationState } from "@/lib/constants";
import { dashboardPathForRole } from "@/lib/auth/guards";
import { WildlifeReportForm } from "./WildlifeReportForm";

type Props = { searchParams: Promise<{ edit?: string }> };

export default async function WildlifeReportPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { edit } = await searchParams;
  const species = await prisma.species.findMany({
    where: { publicationState: PublicationState.APPROVED },
    orderBy: { name: "asc" },
  });

  let existing = null as Awaited<ReturnType<typeof prisma.sightingReport.findFirst>>;
  if (edit) {
    existing = await prisma.sightingReport.findFirst({
      where: { id: edit, reporterId: session.sub, organisationId: session.organisationId },
    });
  }

  const back = dashboardPathForRole(session.role);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href={back} className="text-sm text-emerald-800 underline dark:text-emerald-300">
        ← Dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Wildlife reporting</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Save drafts, then submit for moderation. Your reports stay private until approved for wider use.
      </p>
      <WildlifeReportForm species={species} existing={existing} />
    </main>
  );
}
