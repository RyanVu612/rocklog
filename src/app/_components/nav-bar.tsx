"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { ThemeToggle } from "~/app/_components/theme-toggle";
import { btnGhost, btnPrimary } from "~/app/_components/ui";

const navLink =
  "rounded px-2 py-1 text-muted transition hover:bg-panel hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

export function NavBar() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b border-edge bg-panel">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="font-display text-lg uppercase tracking-tight text-ink"
        >
          🧗 Rocklog
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          {status === "loading" ? null : session ? (
            <>
              <Link href="/" className={navLink}>
                My Climbs
              </Link>
              <Link href="/feed" className={navLink}>
                Feed
              </Link>
              <Link href="/climbs/new" className={`${btnPrimary} px-3 py-1.5`}>
                Log a climb
              </Link>
              <button onClick={() => void signOut()} className={btnGhost}>
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => void signIn()}
              className={`${btnPrimary} px-3 py-1.5`}
            >
              Sign in
            </button>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
