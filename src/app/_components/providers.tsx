"use client";

import { SessionProvider } from "next-auth/react";

import { TRPCReactProvider } from "~/trpc/react";

/** Client-side context providers shared across the app. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TRPCReactProvider>{children}</TRPCReactProvider>
    </SessionProvider>
  );
}
