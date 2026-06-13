import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

const nameKeyOf = (name: string) => name.trim().toLowerCase();

export const gymRouter = createTRPCRouter({
  /**
   * All selectable gyms (approved + pending). Pending gyms are immediately
   * usable (spec requirement 4). The non-deletable "Unknown" gym sorts last.
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const gyms = await ctx.db.gym.findMany({
      orderBy: [{ isUnknown: "asc" }, { name: "asc" }],
    });
    return gyms;
  }),

  /**
   * Submit a gym. If a gym with the same (case-insensitive) name already exists
   * — approved or pending — return it instead of creating a duplicate
   * (dedupe edge case). New gyms are created PENDING but usable immediately.
   */
  submit: protectedProcedure
    .input(
      z.object({
        name: z.string().trim().min(1, "Gym name is required").max(120),
        location: z.string().trim().max(200).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const nameKey = nameKeyOf(input.name);

      const existing = await ctx.db.gym.findUnique({ where: { nameKey } });
      if (existing) return existing;

      return ctx.db.gym.create({
        data: {
          name: input.name.trim(),
          nameKey,
          location: input.location?.trim() || null,
          status: "PENDING",
        },
      });
    }),
});
