"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  btnDanger,
  btnDangerSolid,
  btnPrimary,
  btnSecondary,
  chipNeutral,
} from "~/app/_components/ui";
import { SEND_TYPE_LABELS, VISIBILITY_LABELS } from "~/lib/constants";
import { formatGradeRange } from "~/lib/grades";
import { api, type RouterOutputs } from "~/trpc/react";

export function ClimbDetail({
  climb,
}: {
  climb: RouterOutputs["climb"]["byId"];
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  const deleteMutation = api.climb.delete.useMutation({
    onSuccess: () => {
      router.push("/");
      router.refresh();
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-mono text-3xl font-medium tracking-tight text-ink">
          {formatGradeRange(climb.gradeMin, climb.gradeMax)}
        </h1>
        {climb.colorLabel && (
          <span className={chipNeutral}>{climb.colorLabel}</span>
        )}
        {climb.ropeGrade && (
          <span className={chipNeutral}>{climb.ropeGrade}</span>
        )}
        <span className={chipNeutral}>
          {SEND_TYPE_LABELS[climb.sendType]}
          {climb.sendType !== "FLASH" ? ` · ${climb.attemptCount} attempts` : ""}
        </span>
      </div>

      <p className="text-muted">
        {climb.gym.name} · {new Date(climb.climbedAt).toLocaleString()} ·{" "}
        {VISIBILITY_LABELS[climb.visibility]}
        {!climb.isOwner && climb.user?.name ? ` · by ${climb.user.name}` : ""}
      </p>

      {climb.photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={climb.photoUrl}
          alt="Climb photo"
          className="max-h-[28rem] w-full rounded-lg object-contain"
        />
      )}

      {climb.videoUrl && (
        <video
          src={climb.videoUrl}
          controls
          className="max-h-[28rem] w-full rounded-lg bg-black"
        />
      )}

      {!climb.photoUrl && !climb.videoUrl && (
        <div className="flex h-40 items-center justify-center rounded-lg bg-panel text-4xl text-muted">
          🧗
        </div>
      )}

      {climb.comments && (
        <p className="whitespace-pre-wrap rounded-lg border border-edge bg-panel p-4 text-ink">
          {climb.comments}
        </p>
      )}

      {climb.isOwner && (
        <div className="flex items-center gap-3 border-t border-edge pt-4">
          <Link
            href={`/climbs/${climb.id}/edit`}
            className={`${btnPrimary} text-sm`}
          >
            Edit
          </Link>

          {confirming ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Delete this climb?</span>
              <button
                onClick={() => deleteMutation.mutate({ id: climb.id })}
                disabled={deleteMutation.isPending}
                className={`${btnDangerSolid} text-sm`}
              >
                {deleteMutation.isPending ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className={`${btnSecondary} text-sm`}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className={`${btnDanger} text-sm`}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
