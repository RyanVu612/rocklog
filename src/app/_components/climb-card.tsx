import Link from "next/link";

import { chipNeutral } from "~/app/_components/ui";
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

// Send-type chips on the Rocklog palette: Flash = gold, Send = green,
// Project = ember. Dark text (basalt) reads cleanly on every accent fill.
const sendBadge: Record<Card["sendType"], string> = {
  FLASH: "bg-gold text-basalt",
  SEND: "bg-green text-basalt",
  PROJECT: "bg-ember text-basalt",
};

export function ClimbCard({ climb }: { climb: Card }) {
  return (
    <Link
      href={`/climbs/${climb.id}`}
      className="block rounded-lg border border-edge bg-panel p-4 transition hover:border-muted hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      <div className="flex gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface text-muted">
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
            <span className="font-mono text-lg font-medium text-ink">
              {formatGradeRange(climb.gradeMin, climb.gradeMax)}
            </span>
            {climb.colorLabel && (
              <span className={chipNeutral}>{climb.colorLabel}</span>
            )}
            {climb.ropeGrade && (
              <span className={chipNeutral}>{climb.ropeGrade}</span>
            )}
            <span
              className={`rounded px-2 py-0.5 font-mono text-xs uppercase tracking-wide ${sendBadge[climb.sendType]}`}
            >
              {SEND_TYPE_LABELS[climb.sendType]}
              {climb.sendType !== "FLASH" && climb.attemptCount > 1
                ? ` · ${climb.attemptCount} tries`
                : ""}
            </span>
            {climb.visibility === "PUBLIC" && (
              <span className="rounded bg-teal/20 px-2 py-0.5 text-xs font-medium text-teal">
                Public
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-muted">
            {climb.gym.name} ·{" "}
            {new Date(climb.climbedAt).toLocaleDateString()}
            {climb.user?.name ? ` · ${climb.user.name}` : ""}
          </p>

          {climb.comments && (
            <p className="mt-1 line-clamp-2 text-sm text-ink">
              {climb.comments}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
