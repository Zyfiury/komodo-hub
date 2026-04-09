import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { MessageComposeForm } from "./MessageComposeForm";

export default async function MessagesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const messages = await prisma.message.findMany({
    where: {
      organisationId: session.organisationId,
      OR: [{ toUserId: session.sub }, { fromUserId: session.sub }],
    },
    orderBy: { createdAt: "desc" },
    take: 80,
    include: { fromUser: { select: { name: true } }, toUser: { select: { name: true } } },
  });

  const peers = await prisma.user.findMany({
    where: {
      organisationId: session.organisationId,
      id: { not: session.sub },
      status: "ACTIVE",
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true, role: true },
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Messages</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">Internal organisation messaging only. Nothing here is public.</p>

      <MessageComposeForm peers={peers} />

      <ul className="mt-10 space-y-4">
        {messages.map((m) => {
          const incoming = m.toUserId === session.sub;
          return (
            <li key={m.id} className="rounded-lg border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs text-zinc-500">
                {incoming ? "From" : "To"} {incoming ? m.fromUser.name : m.toUser.name} · {m.createdAt.toISOString()}
                {incoming && !m.readAt ? <span className="ml-2 text-amber-700">Unread</span> : null}
              </p>
              <p className="mt-2 whitespace-pre-wrap">{m.body}</p>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
