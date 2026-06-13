import { type RouterOutputs } from "~/trpc/react";

type SendType = "FLASH" | "SEND" | "PROJECT";
type Visibility = "PRIVATE" | "PUBLIC";

/**
 * The shape ClimbForm expects as its `initial` prop. Kept in this plain module
 * (no "use client") so server components — e.g. the edit page — can import and
 * call `toInitial` without crossing the client/server boundary, which would
 * turn the export into a non-callable client reference.
 */
export type ClimbInitial = {
  id: string;
  gymId: string;
  gradeMin: number;
  gradeMax: number;
  ropeGrade: string | null;
  colorLabel: string | null;
  sendType: SendType;
  attemptCount: number;
  comments: string | null;
  photoPath: string | null;
  videoPath: string | null;
  visibility: Visibility;
  climbedAt: Date;
};

/** Adapt a `climb.byId` result into ClimbForm's `initial`. */
export function toInitial(c: RouterOutputs["climb"]["byId"]): ClimbInitial {
  return {
    id: c.id,
    gymId: c.gymId,
    gradeMin: c.gradeMin,
    gradeMax: c.gradeMax,
    ropeGrade: c.ropeGrade,
    colorLabel: c.colorLabel,
    sendType: c.sendType,
    attemptCount: c.attemptCount,
    comments: c.comments,
    photoPath: c.photoPath,
    videoPath: c.videoPath,
    visibility: c.visibility,
    climbedAt: c.climbedAt,
  };
}
