import { type Prisma, type Climb } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import {
  createSignedUpload,
  removeMedia,
  signDownloadUrl,
  type MediaKind,
} from "~/server/storage";
import { V_GRADE_MAX, V_GRADE_MIN } from "~/lib/grades";

/** Shared input shape for the climb fields a user can set (create/update). */
const climbInput = z
  .object({
    gymId: z.string().min(1, "A gym is required"),
    gradeMin: z.number().int().min(V_GRADE_MIN).max(V_GRADE_MAX),
    gradeMax: z.number().int().min(V_GRADE_MIN).max(V_GRADE_MAX),
    ropeGrade: z.string().trim().max(20).optional().nullable(),
    colorLabel: z.string().trim().max(40).optional().nullable(),
    sendType: z.enum(["FLASH", "SEND", "PROJECT"]),
    attemptCount: z.number().int().min(0).max(100000).default(1),
    comments: z.string().trim().max(5000).optional().nullable(),
    photoPath: z.string().max(500).optional().nullable(),
    videoPath: z.string().max(500).optional().nullable(),
    visibility: z.enum(["PRIVATE", "PUBLIC"]).default("PRIVATE"),
    climbedAt: z.date(),
  })
  // Grade range must be valid (spec edge case: max < min rejected).
  .refine((v) => v.gradeMax >= v.gradeMin, {
    message: "Max grade cannot be lower than min grade",
    path: ["gradeMax"],
  });

/** Normalize attempt count against send type (spec edge case). */
function normalizeAttempts(sendType: string, attemptCount: number): number {
  if (sendType === "FLASH") return 1; // a flash is by definition one attempt
  return Math.max(0, attemptCount);
}

/** Attach signed media URLs to a climb for display. */
async function withMediaUrls(climb: Climb) {
  const [photoUrl, videoUrl] = await Promise.all([
    signDownloadUrl(climb.photoPath),
    signDownloadUrl(climb.videoPath),
  ]);
  return { ...climb, photoUrl, videoUrl };
}

const includeGym = { gym: true } satisfies Prisma.ClimbInclude;

export const climbRouter = createTRPCRouter({
  /** Mint a signed upload URL for a photo/video (spec requirement 3 & 8). */
  createUploadUrl: protectedProcedure
    .input(
      z.object({
        kind: z.enum(["photo", "video"]),
        ext: z.string().min(1).max(10),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return createSignedUpload(
        ctx.session.user.id,
        input.kind as MediaKind,
        input.ext,
      );
    }),

  /** Create a climb owned by the current user. */
  create: protectedProcedure
    .input(climbInput)
    .mutation(async ({ ctx, input }) => {
      const created = await ctx.db.climb.create({
        data: {
          userId: ctx.session.user.id,
          gymId: input.gymId,
          gradeMin: input.gradeMin,
          gradeMax: input.gradeMax,
          ropeGrade: input.ropeGrade?.trim() || null,
          colorLabel: input.colorLabel?.trim() || null,
          sendType: input.sendType,
          attemptCount: normalizeAttempts(input.sendType, input.attemptCount),
          comments: input.comments?.trim() || null,
          photoPath: input.photoPath || null,
          videoPath: input.videoPath || null,
          visibility: input.visibility,
          climbedAt: input.climbedAt,
        },
      });
      return created;
    }),

  /** Update a climb. Only the owner may update; replaced media is removed. */
  update: protectedProcedure
    .input(z.object({ id: z.string().min(1), data: climbInput }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.climb.findUnique({
        where: { id: input.id },
      });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (existing.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const d = input.data;

      // Remove media objects that were replaced or cleared (no orphans).
      const orphaned: (string | null)[] = [];
      if (existing.photoPath && existing.photoPath !== (d.photoPath ?? null)) {
        orphaned.push(existing.photoPath);
      }
      if (existing.videoPath && existing.videoPath !== (d.videoPath ?? null)) {
        orphaned.push(existing.videoPath);
      }
      if (orphaned.length) await removeMedia(orphaned);

      return ctx.db.climb.update({
        where: { id: input.id },
        data: {
          gymId: d.gymId,
          gradeMin: d.gradeMin,
          gradeMax: d.gradeMax,
          ropeGrade: d.ropeGrade?.trim() || null,
          colorLabel: d.colorLabel?.trim() || null,
          sendType: d.sendType,
          attemptCount: normalizeAttempts(d.sendType, d.attemptCount),
          comments: d.comments?.trim() || null,
          photoPath: d.photoPath || null,
          videoPath: d.videoPath || null,
          visibility: d.visibility,
          climbedAt: d.climbedAt,
        },
      });
    }),

  /** Delete a climb (owner only) and remove its media from storage. */
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.climb.findUnique({
        where: { id: input.id },
      });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (existing.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await ctx.db.climb.delete({ where: { id: input.id } });
      await removeMedia([existing.photoPath, existing.videoPath]);
      return { id: input.id };
    }),

  /**
   * The current user's climbs, with filtering and sorting (spec requirement 5).
   * Default order is most-recent-first by climb date.
   */
  list: protectedProcedure
    .input(
      z
        .object({
          gymId: z.string().optional(),
          sendType: z.enum(["FLASH", "SEND", "PROJECT"]).optional(),
          gradeMin: z.number().int().min(V_GRADE_MIN).max(V_GRADE_MAX).optional(),
          gradeMax: z.number().int().min(V_GRADE_MIN).max(V_GRADE_MAX).optional(),
          sortBy: z.enum(["date", "grade"]).default("date"),
          sortDir: z.enum(["asc", "desc"]).default("desc"),
        })
        .default({}),
    )
    .query(async ({ ctx, input }) => {
      const where: Prisma.ClimbWhereInput = {
        userId: ctx.session.user.id,
        ...(input.gymId ? { gymId: input.gymId } : {}),
        ...(input.sendType ? { sendType: input.sendType } : {}),
      };
      // Grade filter: include climbs whose range overlaps the requested bounds.
      if (input.gradeMin !== undefined) where.gradeMax = { gte: input.gradeMin };
      if (input.gradeMax !== undefined) where.gradeMin = { lte: input.gradeMax };

      const orderBy: Prisma.ClimbOrderByWithRelationInput =
        input.sortBy === "grade"
          ? { gradeMax: input.sortDir }
          : { climbedAt: input.sortDir };

      const climbs = await ctx.db.climb.findMany({
        where,
        include: includeGym,
        orderBy,
      });

      return Promise.all(climbs.map((c) => withMediaUrls(c).then((m) => ({ ...m, gym: c.gym }))));
    }),

  /**
   * Public climbs from OTHER users (spec requirement 6: public climbs may be
   * visible to other signed-in users). Never returns private climbs.
   */
  publicList: protectedProcedure.query(async ({ ctx }) => {
    const climbs = await ctx.db.climb.findMany({
      where: {
        visibility: "PUBLIC",
        userId: { not: ctx.session.user.id },
      },
      include: { gym: true, user: { select: { name: true, image: true } } },
      orderBy: { climbedAt: "desc" },
      take: 100,
    });
    return Promise.all(
      climbs.map((c) =>
        withMediaUrls(c).then((m) => ({ ...m, gym: c.gym, user: c.user })),
      ),
    );
  }),

  /**
   * A single climb. The owner sees it always; others only if PUBLIC. A private
   * climb owned by someone else returns NOT_FOUND (spec requirement 9 / edge case).
   */
  byId: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const climb = await ctx.db.climb.findUnique({
        where: { id: input.id },
        include: { gym: true, user: { select: { name: true, image: true } } },
      });
      if (!climb) throw new TRPCError({ code: "NOT_FOUND" });

      const isOwner = climb.userId === ctx.session.user.id;
      if (!isOwner && climb.visibility !== "PUBLIC") {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const media = await withMediaUrls(climb);
      return { ...media, gym: climb.gym, user: climb.user, isOwner };
    }),
});
