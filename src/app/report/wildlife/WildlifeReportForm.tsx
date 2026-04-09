"use client";

import { useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveSightingDraft, submitSighting, type SimpleState } from "@/app/actions/sightings";
import type { Species, SightingReport } from "@prisma/client";

export function WildlifeReportForm({
  species,
  existing,
}: {
  species: Species[];
  existing: SightingReport | null;
}) {
  const router = useRouter();
  const initial: SimpleState = {};
  const [state, action, pending] = useActionState(saveSightingDraft, initial);
  const [mediaId, setMediaId] = useState("");
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadFile() {
    const input = fileRef.current;
    if (!input?.files?.[0]) return;
    const fd = new FormData();
    fd.set("file", input.files[0]);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) return;
    const data = (await res.json()) as { id?: string };
    if (data.id) setMediaId(data.id);
  }

  const reportId = existing?.id ?? state.id ?? null;

  async function onSubmitModeration() {
    if (!reportId) return;
    setSubmitting(true);
    setSubmitErr(null);
    const r = await submitSighting(reportId);
    setSubmitting(false);
    if (r.error) setSubmitErr(r.error);
    else router.push("/report/wildlife");
    router.refresh();
  }

  const obs = existing?.observedAt ? new Date(existing.observedAt).toISOString().slice(0, 16) : "";

  return (
    <div className="mt-8 space-y-6">
      <form action={action} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        {existing && <input type="hidden" name="id" value={existing.id} />}
        <input type="hidden" name="mediaAssetId" value={mediaId} />
        <label className="block text-sm">
          Species (approved list)
          <select name="speciesId" defaultValue={existing?.speciesId ?? ""} className="mt-1 w-full rounded border px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950">
            <option value="">—</option>
            {species.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Species free text (if unsure)
          <input name="speciesFreeText" defaultValue={existing?.speciesFreeText ?? ""} className="mt-1 w-full rounded border px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950" />
        </label>
        <label className="block text-sm">
          Observed at
          <input name="observedAt" type="datetime-local" defaultValue={obs} required className="mt-1 w-full rounded border px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950" />
        </label>
        <label className="block text-sm">
          Location label
          <input name="locationLabel" defaultValue={existing?.locationLabel ?? ""} className="mt-1 w-full rounded border px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950" />
        </label>
        <label className="block text-sm">
          Latitude (optional)
          <input name="latitude" defaultValue={existing?.latitude ?? ""} className="mt-1 w-full rounded border px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950" />
        </label>
        <label className="block text-sm">
          Longitude (optional)
          <input name="longitude" defaultValue={existing?.longitude ?? ""} className="mt-1 w-full rounded border px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950" />
        </label>
        <label className="block text-sm">
          Description
          <textarea name="description" rows={4} defaultValue={existing?.description ?? ""} className="mt-1 w-full rounded border px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950" />
        </label>
        <div className="text-sm">
          <p className="font-medium">Media upload (optional)</p>
          <input ref={fileRef} type="file" accept="image/*" className="mt-1" />
          <button type="button" onClick={() => void uploadFile()} className="ml-2 rounded border px-2 py-1 text-xs">
            Upload
          </button>
          {mediaId && <span className="ml-2 text-xs text-emerald-700">Attached asset id: {mediaId}</span>}
        </div>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state.id && !existing && <p className="text-sm text-zinc-600">Draft id: {state.id} (saved)</p>}
        <button type="submit" disabled={pending} className="rounded bg-zinc-800 px-4 py-2 text-sm text-white dark:bg-zinc-200 dark:text-zinc-900">
          {pending ? "Saving…" : "Save draft"}
        </button>
      </form>

      {reportId && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm dark:border-emerald-900/40 dark:bg-emerald-950/30">
          {submitErr && <p className="mb-2 text-red-600">{submitErr}</p>}
          <button
            type="button"
            disabled={submitting}
            onClick={() => void onSubmitModeration()}
            className="rounded bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit for moderation"}
          </button>
        </div>
      )}
    </div>
  );
}
