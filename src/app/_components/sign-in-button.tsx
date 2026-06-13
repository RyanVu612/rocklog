"use client";

import { signIn } from "next-auth/react";

export function SignInButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => void signIn()}
      className={
        className ??
        "rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700"
      }
    >
      Sign in to start logging
    </button>
  );
}
