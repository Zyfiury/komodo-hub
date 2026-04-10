"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { joinCampaignFromForm, type SimpleState } from "@/app/actions/campaigns";

const initial: SimpleState = {};

export function JoinCampaignClient({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(joinCampaignFromForm, initial);

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  return (
    <form action={action} className="mt-4">
      <input type="hidden" name="campaignId" value={campaignId} />
      {state.error && <p className="mb-2 text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
      >
        {pending ? "Joining…" : "Join or follow this campaign"}
      </button>
    </form>
  );
}
