import { RegisterOrganisationForm } from "./RegisterOrganisationForm";

export default function RegisterOrganisationPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-semibold">Register organisation</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Create a school or community organisation. You will become the organisation administrator for that organisation.
      </p>
      <RegisterOrganisationForm />
    </main>
  );
}
