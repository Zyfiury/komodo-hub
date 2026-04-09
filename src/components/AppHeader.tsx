import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { dashboardPathForRole } from "@/lib/auth/guards";
import { LogoutButton } from "@/components/LogoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";

export async function AppHeader() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/70 bg-white/70 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/70">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-sm">
            K
          </span>
          <span className="text-zinc-900 dark:text-zinc-50">Komodo Hub</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-700 dark:text-zinc-200">
          <Link href="/library" className="hover:text-zinc-900 hover:underline dark:hover:text-white">
            Library
          </Link>
          <Link href="/campaigns" className="hover:text-zinc-900 hover:underline dark:hover:text-white">
            Campaigns
          </Link>
          <Link href="/species" className="hover:text-zinc-900 hover:underline dark:hover:text-white">
            Species
          </Link>
          <Link href="/privacy" className="hover:text-zinc-900 hover:underline dark:hover:text-white">
            Privacy
          </Link>
          <span className="mx-1 hidden h-4 w-px bg-zinc-300 dark:bg-zinc-700 sm:inline" />
          {session ? (
            <>
              <Link href={dashboardPathForRole(session.role)} className="font-medium hover:text-zinc-900 hover:underline dark:hover:text-white">
                Dashboard
              </Link>
              <Link href="/messages" className="hover:text-zinc-900 hover:underline dark:hover:text-white">
                Messages
              </Link>
              {session.role === "FOUNDATION_ADMIN" && (
                <Link href="/moderation" className="hover:text-zinc-900 hover:underline dark:hover:text-white">
                  Moderation
                </Link>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-zinc-900 hover:underline dark:hover:text-white">
                Log in
              </Link>
              <Link
                href="/register/organisation"
                className="rounded-md bg-emerald-700 px-3 py-1.5 font-medium text-white shadow-sm hover:bg-emerald-600"
              >
                Register organisation
              </Link>
            </>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
