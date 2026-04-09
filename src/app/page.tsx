import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="kh-bg kh-noise">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="relative z-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-3 py-1 text-xs font-medium text-emerald-800 shadow-sm backdrop-blur dark:border-emerald-900/40 dark:bg-zinc-950/40 dark:text-emerald-200">
              Privacy-first participation · Moderated publishing · Real programmes
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
              Conservation learning and reporting for Indonesia
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
              Komodo Hub connects schools, communities, foundation staff, and the public in one secure system for learning,
              programme delivery, wildlife reporting, and moderated content.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/library"
                className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-600"
              >
                Browse public library
              </Link>
              <Link
                href="/campaigns"
                className="rounded-lg border border-zinc-300 bg-white/60 px-5 py-2.5 text-sm font-medium text-zinc-800 shadow-sm backdrop-blur hover:bg-white dark:border-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-100 dark:hover:bg-zinc-900"
              >
                View campaigns
              </Link>
              <Link
                href="/login"
                className="rounded-lg px-5 py-2.5 text-sm font-medium text-emerald-800 underline underline-offset-4 dark:text-emerald-300"
              >
                Log in
              </Link>
            </div>
            <div className="mt-10 grid gap-3 text-sm text-zinc-700 dark:text-zinc-300 sm:grid-cols-2">
              <Feature title="Moderation first">Every public item is reviewed before it appears publicly.</Feature>
              <Feature title="School privacy">Student pages, submissions, notes, and messages never go public.</Feature>
              <Feature title="Real reporting">Draft wildlife reports, submit, and track approval status.</Feature>
              <Feature title="Operational dashboards">Live counts for work due, submissions, moderation, and usage.</Feature>
            </div>
          </div>

          <div className="relative z-10">
            <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white/70 p-8 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40">
              <div className="pointer-events-none absolute inset-0 opacity-25 dark:opacity-20">
                <Image
                  src="/animals/sea-turtle.jpg"
                  alt=""
                  fill
                  priority
                  className="object-cover"
                  sizes="(min-width: 1024px) 520px, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-white/10 dark:from-zinc-950 dark:via-zinc-950/70 dark:to-zinc-950/20" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Komodo Hub</p>
                  <p className="mt-1 text-lg font-semibold">Public content, safe by default</p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Approved species, campaigns, and library items for visitors—private work stays inside organisations.
                  </p>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/komodo-mark.svg" alt="" className="h-20 w-20 opacity-90" />
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Card title="For schools" body="Programmes, assignments, submissions, feedback, and student reporting—private by role and organisation." />
                <Card title="For communities" body="Member contributions and sightings—publish only after foundation moderation." />
                <Card title="For foundation staff" body="Moderation queue, organisation governance, campaign tools, analytics, and audit trail." />
                <Card title="For visitors" body="Browse approved campaigns, species, and library content without registration." />
              </div>
            </div>
          </div>
        </div>

        <section className="relative z-10 mt-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Wildlife focus areas</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                A clean way to browse and learn—while rescue reporting and internal work stays protected.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Tile href="/species" title="Komodo" subtitle="Reptiles and island ecosystems" img="/animals/komodo.jpg" />
            <Tile href="/species" title="Marine rescue" subtitle="Turtles, rays, reefs" img="/animals/manta-ray.jpg" />
            <Tile href="/species" title="Forest guardians" subtitle="Orangutans and habitat learning" img="/animals/orangutan.jpg" />
            <Tile href="/species" title="Bird conservation" subtitle="Including Bali myna" img="/animals/bali-myna.jpg" />
            <Tile href="/species" title="Deer and prey species" subtitle="Sunda deer and park ecology" img="/animals/rusa-deer.jpg" />
            <Tile href="/species" title="Sea turtles" subtitle="Reporting and education" img="/animals/sea-turtle.jpg" />
          </div>
        </section>
      </div>
    </main>
  );
}

function Feature({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white/60 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/30">
      <p className="font-medium text-zinc-900 dark:text-zinc-50">{title}</p>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{children}</p>
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white/60 p-4 dark:border-zinc-800 dark:bg-zinc-950/30">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{body}</p>
    </div>
  );
}

function Tile({ href, title, subtitle, img }: { href: string; title: string; subtitle: string; img: string }) {
  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white/70 shadow-sm backdrop-blur hover:bg-white dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:bg-zinc-900"
    >
      <div className="relative h-40 w-full">
        <Image src={img} alt="" fill className="object-cover" sizes="(min-width: 1024px) 360px, 100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
      </div>
      <div className="p-4">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
        <p className="mt-3 text-sm font-medium text-emerald-800 underline underline-offset-4 dark:text-emerald-300">
          Explore
        </p>
      </div>
    </Link>
  );
}
