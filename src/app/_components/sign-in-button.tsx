"use client";

import { signIn } from "next-auth/react";

import { btnPrimary } from "~/app/_components/ui";

export function SignInButton({ className }: { className?: string }) {
  return (
    <button onClick={() => void signIn()} className={className ?? btnPrimary}>
      Sign in to start logging
    </button>
  );
}
