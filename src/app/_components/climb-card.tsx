import Link from "next/link";

import { SEND_TYPE_LABELS } from "~/lib/constants";
import { formatGradeRange } from "~/lib/grades";

type Card = {
  id: string;
  gradeMin: number;
  gradeMax: number;
  ropeGrade: string | null;
  colorLabel: string | null;
  sendType: "FLASH" | "SEND" | "PROJECT";
  attemptCount: number;
  comments: string | null;
  photoUrl: string | null;
  videoUrl: string | null;
  visibility: "PRIVATE" | "PUBLIC";
  climbedAt: Date;
  gym: { name: string };
  user?: { name: string | null; image: string | null } | null;
};

const sendBadge: Record<Card["sendType"], string> = {
  FLASH: "bg-amber-100 text-amber-800",
  SEND: "bg-green-100 text-green-800",
  PROJECT: "bg-sky-100 text-sky-800",
};

export function ClimbCard({ climb }: { climb: Card }) {
  return (
    <Link
      href={`/climbs/${climb.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100 text-slate-400">
          {climb.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={climb.photoUrl}
              alt="Climb"
              className="h-full w-full object-cover"
            />
          ) : climb.videoUrl ? (
            <span className="text-xs">🎬 video</span>
          ) : (
            <span className="text-2xl">🧗</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-semibold">
              {formatGradeRange(climb.gradeMin, climb.gradeMax)}
            </span>
            {climb.colorLabel && (
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {climb.colorLabel}
              </span>
            )}
            {climb.ropeGrade && (
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {climb.ropeGrade}
              </span>
            )}
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${sendBadge[climb.sendType]}`}
            >
              {SEND_TYPE_LABELS[climb.sendType]}
              {climb.sendType !== "FLASH" && climb.attemptCount > 1
                ? ` · ${climb.attemptCount} tries`
                : ""}
            </span>
            {climb.visibility === "PUBLIC" && (
              <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                Public
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-slate-500">
            {climb.gym.name} ·{" "}
            {new Date(climb.climbedAt).toLocaleDateString()}
            {climb.user?.name ? ` · ${climb.user.name}` : ""}
          </p>

          {climb.comments && (
            <p className="mt-1 line-clamp-2 text-sm text-slate-600">
              {climb.comments}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
