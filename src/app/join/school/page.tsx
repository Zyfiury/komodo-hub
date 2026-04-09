import { JoinSchoolForm } from "./JoinSchoolForm";

export default function JoinSchoolPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-semibold">Join a school with an access code</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Your school administrator generates access codes. You will create a student account linked to that school.
      </p>
      <JoinSchoolForm />
    </main>
  );
}
