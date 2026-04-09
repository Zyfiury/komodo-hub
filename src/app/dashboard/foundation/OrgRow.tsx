import { setOrganisationStatus, setOrganisationPublicProfile } from "@/app/actions/foundationOrg";
import { OrgStatus } from "@/lib/constants";
import type { Organisation, Subscription } from "@prisma/client";

type OrgWithSub = Organisation & { subscriptions: Subscription[] };

export function OrgRow({ org }: { org: OrgWithSub }) {
  async function applyStatus(formData: FormData) {
    "use server";
    const st = String(formData.get("status") ?? "");
    await setOrganisationStatus(org.id, st);
  }

  async function togglePublic() {
    "use server";
    await setOrganisationPublicProfile(org.id, !org.publicProfile);
  }

  return (
    <tr className="border-b border-zinc-100 dark:border-zinc-800">
      <td className="py-2 pr-4">{org.name}</td>
      <td className="py-2 pr-4">{org.type}</td>
      <td className="py-2 pr-4">{org.status}</td>
      <td className="py-2 pr-4">{org.publicProfile ? "yes" : "no"}</td>
      <td className="py-2 pr-4">{org.subscriptions[0]?.status ?? "—"}</td>
      <td className="py-2">
        <div className="flex flex-wrap gap-2">
          <form action={applyStatus} className="flex items-center gap-1">
            <select name="status" defaultValue={org.status} className="rounded border border-zinc-300 text-xs dark:border-zinc-600 dark:bg-zinc-950">
              {Object.values(OrgStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button type="submit" className="text-xs text-emerald-800 underline dark:text-emerald-300">
              Set
            </button>
          </form>
          <form action={togglePublic}>
            <button type="submit" className="text-xs text-emerald-800 underline dark:text-emerald-300">
              Toggle public profile
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
