"use client";

import { useActionState } from "react";
import { joinSchoolWithCode, type JoinSchoolState } from "@/app/actions/joinSchool";

const initial: JoinSchoolState = {};

export function JoinSchoolForm() {
  const [state, action, pending] = useActionState(joinSchoolWithCode, initial);

  return (
    <form action={action} className="mt-8 space-y-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <label className="block text-sm font-medium">
        Access code
        <input name="code" required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950" />
      </label>
      <label className="block text-sm font-medium">
        Your name
        <input name="name" required className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950" />
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
        {pending ? "Joining…" : "Create student account"}
      </button>
    </form>
  );
}
