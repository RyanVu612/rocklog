"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export function NavBar() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          🧗 Rocklog
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          {status === "loading" ? null : session ? (
            <>
              <Link
                href="/"
                className="rounded px-2 py-1 text-slate-600 hover:bg-slate-100"
              >
                My Climbs
              </Link>
              <Link
                href="/feed"
                className="rounded px-2 py-1 text-slate-600 hover:bg-slate-100"
              >
                Feed
              </Link>
              <Link
                href="/climbs/new"
                className="rounded-md bg-slate-900 px-3 py-1.5 font-medium text-white hover:bg-slate-700"
              >
                Log a climb
              </Link>
              <button
                onClick={() => void signOut()}
                className="rounded px-2 py-1 text-slate-500 hover:bg-slate-100"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => void signIn()}
              className="rounded-md bg-slate-900 px-3 py-1.5 font-medium text-white hover:bg-slate-700"
            >
              Sign in
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
