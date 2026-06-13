import "server-only";

import { headers } from "next/headers";
import { cache } from "react";

import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

/**
 * Server-side tRPC caller for React Server Components. Wraps the context
 * creation so RSC code can call procedures directly (e.g. `await api.climb.byId(...)`).
 */
const createContext = cache(async () => {
  const heads = new Headers(headers());
  heads.set("x-trpc-source", "rsc");
  return createTRPCContext({ headers: heads });
});

export const api = createCaller(createContext);
