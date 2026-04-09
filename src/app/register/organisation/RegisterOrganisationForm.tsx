"use client";

import { useActionState } from "react";
import { registerOrganisation, type RegisterState } from "@/app/actions/register";

const initial: RegisterState = {};

export function RegisterOrganisationForm() {
  const [state, action, pending] = useActionState(registerOrganisation, initial);

  return (
    <form action={action} className="mt-8 space-y-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <label className="block text-sm font-medium">
        Organisation name
        <input name="orgName" required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950" />
      </label>
      <label className="block text-sm font-medium">
        URL slug (lowercase, letters, numbers, hyphens)
        <input
          name="orgSlug"
          required
          pattern="[a-z0-9-]{2,64}"
          title="Lowercase letters, numbers, and hyphens only"
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
        />
      </label>
      <label className="block text-sm font-medium">
        Public description
        <textarea name="description" rows={3} className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950" />
      </label>
      <fieldset className="text-sm">
        <legend className="font-medium">Organisation type</legend>
        <label className="mt-2 flex items-center gap-2">
          <input type="radio" name="orgKind" value="SCHOOL" defaultChecked />
          School
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="orgKind" value="COMMUNITY" />
          Community
        </label>
      </fieldset>
      <label className="block text-sm font-medium">
        Your name
        <input name="adminName" required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950" />
      </label>
      <label className="block text-sm font-medium">
        Email
        <input name="email" type="email" required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950" />
      </label>
      <label className="block text-sm font-medium">
        Password (min 8 characters)
        <input name="password" type="password" minLength={8} required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950" />
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.fieldErrors &&
        Object.entries(state.fieldErrors).map(([k, v]) => (
          <p key={k} className="text-sm text-red-600">
            {k}: {v}
          </p>
        ))}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-emerald-700 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create organisation"}
      </button>
    </form>
  );
}
