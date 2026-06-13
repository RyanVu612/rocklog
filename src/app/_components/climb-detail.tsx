"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
        <h1 className="text-2xl font-bold">
          {formatGradeRange(climb.gradeMin, climb.gradeMax)}
        </h1>
        {climb.colorLabel && (
          <span className="rounded bg-slate-100 px-2 py-0.5 text-sm text-slate-600">
            {climb.colorLabel}
          </span>
        )}
        {climb.ropeGrade && (
          <span className="rounded bg-slate-100 px-2 py-0.5 text-sm text-slate-600">
            {climb.ropeGrade}
          </span>
        )}
        <span className="rounded bg-slate-100 px-2 py-0.5 text-sm text-slate-700">
          {SEND_TYPE_LABELS[climb.sendType]}
          {climb.sendType !== "FLASH" ? ` · ${climb.attemptCount} attempts` : ""}
        </span>
      </div>

      <p className="text-slate-500">
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
        <div className="flex h-40 items-center justify-center rounded-lg bg-slate-100 text-4xl text-slate-300">
          🧗
        </div>
      )}

      {climb.comments && (
        <p className="whitespace-pre-wrap rounded-lg bg-white p-4 text-slate-700">
          {climb.comments}
        </p>
      )}

      {climb.isOwner && (
        <div className="flex items-center gap-3 border-t border-slate-200 pt-4">
          <Link
            href={`/climbs/${climb.id}/edit`}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Edit
          </Link>

          {confirming ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Delete this climb?</span>
              <button
                onClick={() => deleteMutation.mutate({ id: climb.id })}
                disabled={deleteMutation.isPending}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
