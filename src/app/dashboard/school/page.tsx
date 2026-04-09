import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { requireRoles } from "@/lib/auth/guards";
import { UserRole, OrgType } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { AccessCodeForm } from "./AccessCodeForm";
import { MemberRow } from "./MemberRow";

export default async function SchoolDashboardPage() {
  const session = requireRoles(await getSession(), [UserRole.SCHOOL_ADMIN]);

  const org = await prisma.organisation.findUnique({
    where: { id: session.organisationId },
  });
  if (!org || org.type !== OrgType.SCHOOL) {
    return <p className="p-8">This dashboard is for school organisations only.</p>;
  }

  const [teachers, students, programmes, codes, members] = await Promise.all([
    prisma.user.count({ where: { organisationId: org.id, role: UserRole.TEACHER } }),
    prisma.user.count({ where: { organisationId: org.id, role: UserRole.STUDENT } }),
    prisma.programme.findMany({
      where: { organisationId: org.id },
      include: { owner: { select: { name: true } }, activities: true },
    }),
    prisma.accessCode.findMany({
      where: { schoolOrganisationId: org.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.user.findMany({
      where: { organisationId: org.id },
      orderBy: [{ role: "asc" }, { name: "asc" }],
      select: { id: true, name: true, email: true, role: true, status: true },
    }),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold">School admin</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{org.name}</p>
      {org.publicProfile && (
        <p className="mt-2 text-sm">
          Public school page:{" "}
          <Link href={`/schools/${org.slug}`} className="font-medium text-emerald-800 underline dark:text-emerald-300">
            /schools/{org.slug}
          </Link>
        </p>
      )}

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs uppercase text-zinc-500">Teachers</p>
          <p className="text-2xl font-semibold">{teachers}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs uppercase text-zinc-500">Students</p>
          <p className="text-2xl font-semibold">{students}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs uppercase text-zinc-500">Programmes</p>
          <p className="text-2xl font-semibold">{programmes.length}</p>
        </div>
      </section>

      <section className="mt-10 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-medium">Student access codes</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Generate codes for students to join this school at /join/school.</p>
        <AccessCodeForm />
        <ul className="mt-6 space-y-2 text-sm">
          {codes.map((c) => (
            <li key={c.id} className="flex flex-wrap justify-between gap-2 border-b border-zinc-100 py-2 dark:border-zinc-800">
              <code>{c.code}</code>
              <span className="text-zinc-500">
                used {c.usedCount}/{c.maxUses}
                {c.expiresAt ? ` · expires ${c.expiresAt.toISOString()}` : ""}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-medium">Members</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Activate or deactivate accounts (teachers and students). School admins are protected.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((u) => (
                <MemberRow key={u.id} user={u} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Programmes</h2>
        <ul className="mt-4 space-y-2">
          {programmes.map((p) => (
            <li key={p.id}>
              <Link href={`/programmes/${p.id}`} className="font-medium text-emerald-800 hover:underline dark:text-emerald-300">
                {p.title}
              </Link>
              <span className="ml-2 text-sm text-zinc-500">Lead: {p.owner.name} · {p.activities.length} activities</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
