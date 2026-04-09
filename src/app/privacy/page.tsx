export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Privacy</h1>
      <div className="prose prose-zinc mt-6 max-w-none text-sm leading-relaxed dark:prose-invert">
        <p>
          Komodo Hub is built for privacy-first participation. Public visitors see only moderated campaigns, species profiles, and
          library items that have been approved for publication.
        </p>
        <p>
          Student profile pages are never public. Student submissions, internal teacher notes, internal messages, and detailed
          progress history stay within the school organisation and authorised roles.
        </p>
        <p>
          Community public pages show only approved organisation content and approved member contributions. Every protected page
          and API action enforces role boundaries and organisation boundaries.
        </p>
        <p>
          Telemetry used for service efficiency is stored separately from learning content and is limited to operational summaries
          where possible.
        </p>
      </div>
    </main>
  );
}
