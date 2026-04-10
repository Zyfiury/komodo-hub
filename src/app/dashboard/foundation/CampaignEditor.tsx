import Link from "next/link";
import { updateCampaign } from "@/app/actions/campaigns";
import { CampaignStatus } from "@/lib/constants";
import type { Campaign } from "@prisma/client";

export function CampaignEditor({ campaign }: { campaign: Campaign }) {
  async function save(formData: FormData) {
    "use server";
    await updateCampaign(campaign.id, {}, formData);
  }

  return (
    <li className="rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
      <form action={save} className="grid gap-2 sm:grid-cols-2">
        <label className="text-sm sm:col-span-2">
          Title
          <input name="title" defaultValue={campaign.title} className="mt-1 w-full rounded border px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950" />
        </label>
        <label className="text-sm sm:col-span-2">
          Summary
          <input name="summary" defaultValue={campaign.summary} className="mt-1 w-full rounded border px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950" />
        </label>
        <label className="text-sm sm:col-span-2">
          Body
          <textarea name="body" defaultValue={campaign.body} rows={2} className="mt-1 w-full rounded border px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublic" defaultChecked={campaign.isPublic} /> Public
        </label>
        <label className="text-sm">
          Status
          <select name="status" defaultValue={campaign.status} className="mt-1 w-full rounded border px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950">
            {Object.values(CampaignStatus).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="rounded bg-zinc-800 px-3 py-1.5 text-sm text-white sm:col-span-2 dark:bg-zinc-200 dark:text-zinc-900">
          Save campaign
        </button>
      </form>
      <p className="mt-2 text-xs text-zinc-500">
        Slug: <code>{campaign.slug}</code> ·{" "}
        <Link href={`/campaigns/${campaign.slug}`} className="text-emerald-800 underline dark:text-emerald-300">
          public view
        </Link>
      </p>
    </li>
  );
}
