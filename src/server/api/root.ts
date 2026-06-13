import { climbRouter } from "~/server/api/routers/climb";
import { gymRouter } from "~/server/api/routers/gym";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * The root tRPC router. All sub-routers are merged here.
 */
export const appRouter = createTRPCRouter({
  climb: climbRouter,
  gym: gymRouter,
});

export type AppRouter = typeof appRouter;

/**
 * Server-side caller factory for invoking procedures from RSC / server code.
 */
export const createCaller = createCallerFactory(appRouter);
