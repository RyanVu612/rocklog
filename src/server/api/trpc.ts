/**
 * tRPC initialization: context, transformer, and the procedure helpers used by
 * the routers. Public procedures are open; protected procedures require a
 * signed-in user (spec requirement 2 & 9).
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";

/**
 * Context available to every procedure. `session` is null when signed out.
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await getServerAuthSession();
  return {
    db,
    session,
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

/** Public (unauthenticated) procedure. */
export const publicProcedure = t.procedure;

/** Procedure that requires an authenticated session. */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // Narrow `session` so downstream procedures see a non-null user.
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});
