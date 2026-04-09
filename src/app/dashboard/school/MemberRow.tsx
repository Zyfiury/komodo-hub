import { setMemberStatus } from "@/app/actions/members";
import { UserStatus } from "@/lib/constants";
import type { User } from "@prisma/client";

export function MemberRow({ user }: { user: Pick<User, "id" | "name" | "email" | "role" | "status"> }) {
  async function activate() {
    "use server";
    await setMemberStatus(user.id, UserStatus.ACTIVE);
  }

  async function deactivate() {
    "use server";
    await setMemberStatus(user.id, UserStatus.INACTIVE);
  }

  return (
    <tr className="border-b border-zinc-100 dark:border-zinc-800">
      <td className="py-2 pr-4">{user.name}</td>
      <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">{user.email}</td>
      <td className="py-2 pr-4">{user.role}</td>
      <td className="py-2 pr-4">{user.status}</td>
      <td className="py-2">
        {user.role !== "SCHOOL_ADMIN" && (
          <div className="flex gap-2">
            <form action={activate}>
              <button type="submit" className="text-xs text-emerald-800 underline dark:text-emerald-300">
                Activate
              </button>
            </form>
            <form action={deactivate}>
              <button type="submit" className="text-xs text-red-700 underline">
                Deactivate
              </button>
            </form>
          </div>
        )}
      </td>
    </tr>
  );
}
