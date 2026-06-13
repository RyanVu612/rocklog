"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { MediaUpload } from "~/app/_components/media-upload";
import {
  btnPrimary,
  btnSecondary,
  inputBase,
} from "~/app/_components/ui";
import {
  COLOR_LABELS,
  SEND_TYPES,
} from "~/lib/constants";
import { ROPE_GRADES, V_GRADES, formatVGrade } from "~/lib/grades";
import { api } from "~/trpc/react";

import { type ClimbInitial } from "~/app/_components/climb-initial";

type SendType = "FLASH" | "SEND" | "PROJECT";
type Visibility = "PRIVATE" | "PUBLIC";

export { type ClimbInitial };

/** Format a Date as a value for <input type="datetime-local"> in local time. */
function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

const labelClass = "block text-sm font-medium text-ink";
const optionalClass = "font-normal text-muted";

export function ClimbForm({ initial }: { initial?: ClimbInitial }) {
  const router = useRouter();
  const isEdit = !!initial;

  const gymsQuery = api.gym.list.useQuery();
  const utils = api.useUtils();

  const [gymId, setGymId] = useState(initial?.gymId ?? "");
  const [gradeMin, setGradeMin] = useState(initial?.gradeMin ?? 0);
  const [gradeMax, setGradeMax] = useState(initial?.gradeMax ?? 0);
  const [ropeGrade, setRopeGrade] = useState(initial?.ropeGrade ?? "");
  const [colorLabel, setColorLabel] = useState(initial?.colorLabel ?? "");
  const [sendType, setSendType] = useState<SendType>(
    initial?.sendType ?? "SEND",
  );
  const [attemptCount, setAttemptCount] = useState(initial?.attemptCount ?? 1);
  const [comments, setComments] = useState(initial?.comments ?? "");
  const [photoPath, setPhotoPath] = useState<string | null>(
    initial?.photoPath ?? null,
  );
  const [videoPath, setVideoPath] = useState<string | null>(
    initial?.videoPath ?? null,
  );
  const [visibility, setVisibility] = useState<Visibility>(
    initial?.visibility ?? "PRIVATE",
  );
  const [climbedAt, setClimbedAt] = useState(
    toLocalInputValue(initial?.climbedAt ?? new Date()),
  );

  const [formError, setFormError] = useState<string | null>(null);

  // Inline "add a gym" UI.
  const [showAddGym, setShowAddGym] = useState(false);
  const [newGymName, setNewGymName] = useState("");
  const [newGymLocation, setNewGymLocation] = useState("");
  const submitGym = api.gym.submit.useMutation({
    onSuccess: async (gym) => {
      await utils.gym.list.invalidate();
      setGymId(gym.id);
      setShowAddGym(false);
      setNewGymName("");
      setNewGymLocation("");
    },
  });

  const createMutation = api.climb.create.useMutation({
    onSuccess: async () => {
      await utils.climb.list.invalidate();
      router.push("/");
      router.refresh();
    },
    onError: (e) => setFormError(e.message),
  });
  const updateMutation = api.climb.update.useMutation({
    onSuccess: async () => {
      await utils.climb.list.invalidate();
      router.push(`/climbs/${initial!.id}`);
      router.refresh();
    },
    onError: (e) => setFormError(e.message),
  });

  const saving =
    createMutation.isPending || updateMutation.isPending || submitGym.isPending;
  const isFlash = sendType === "FLASH";

  const gymOptions = useMemo(() => gymsQuery.data ?? [], [gymsQuery.data]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    // If the user typed a new gym but didn't click "Add gym", save it now so
    // they don't lose their input or hit a confusing "select a gym" error.
    let effectiveGymId = gymId;
    if (!effectiveGymId && showAddGym && newGymName.trim()) {
      try {
        const gym = await submitGym.mutateAsync({
          name: newGymName,
          location: newGymLocation || undefined,
        });
        effectiveGymId = gym.id;
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Could not add gym.");
        return;
      }
    }

    if (!effectiveGymId) {
      setFormError("Please select or add a gym.");
      return;
    }
    if (gradeMax < gradeMin) {
      setFormError("Max grade cannot be lower than min grade.");
      return;
    }

    const data = {
      gymId: effectiveGymId,
      gradeMin,
      gradeMax,
      ropeGrade: ropeGrade || null,
      colorLabel: colorLabel || null,
      sendType,
      attemptCount: isFlash ? 1 : attemptCount,
      comments: comments || null,
      photoPath,
      videoPath,
      visibility,
      climbedAt: new Date(climbedAt),
    };

    if (isEdit) {
      updateMutation.mutate({ id: initial!.id, data });
    } else {
      createMutation.mutate(data);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Gym */}
      <div>
        <label className={labelClass}>Gym</label>
        <div className="mt-1 flex gap-2">
          <select
            value={gymId}
            onChange={(e) => setGymId(e.target.value)}
            className={inputBase}
          >
            <option value="">Select a gym…</option>
            {gymOptions.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
                {g.status === "PENDING" ? " (pending)" : ""}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowAddGym((s) => !s)}
            className={`${btnSecondary} whitespace-nowrap text-sm`}
          >
            + New gym
          </button>
        </div>

        {showAddGym && (
          <div className="mt-2 space-y-2 rounded-md border border-edge bg-surface p-3">
            <input
              value={newGymName}
              onChange={(e) => setNewGymName(e.target.value)}
              placeholder="Gym name"
              className={`${inputBase} text-sm`}
            />
            <input
              value={newGymLocation}
              onChange={(e) => setNewGymLocation(e.target.value)}
              placeholder="Location (optional)"
              className={`${inputBase} text-sm`}
            />
            <p className="text-xs text-muted">
              New gyms are usable right away and reviewed before being added to
              the shared list.
            </p>
            <button
              type="button"
              disabled={submitGym.isPending || !newGymName.trim()}
              onClick={() =>
                submitGym.mutate({
                  name: newGymName,
                  location: newGymLocation || undefined,
                })
              }
              className={`${btnPrimary} text-sm`}
            >
              {submitGym.isPending ? "Adding…" : "Add gym"}
            </button>
          </div>
        )}
      </div>

      {/* Grade range */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Grade (min)</label>
          <select
            value={gradeMin}
            onChange={(e) => {
              const v = Number(e.target.value);
              setGradeMin(v);
              if (gradeMax < v) setGradeMax(v);
            }}
            className={`${inputBase} mt-1`}
          >
            {V_GRADES.map((v) => (
              <option key={v} value={v}>
                {formatVGrade(v)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Grade (max)</label>
          <select
            value={gradeMax}
            onChange={(e) => setGradeMax(Number(e.target.value))}
            className={`${inputBase} mt-1`}
          >
            {V_GRADES.filter((v) => v >= gradeMin).map((v) => (
              <option key={v} value={v}>
                {formatVGrade(v)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Color label + rope grade */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>
            Color label <span className={optionalClass}>(optional)</span>
          </label>
          <input
            list="color-labels"
            value={colorLabel}
            onChange={(e) => setColorLabel(e.target.value)}
            placeholder="e.g. Pink"
            className={`${inputBase} mt-1`}
          />
          <datalist id="color-labels">
            {COLOR_LABELS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div>
          <label className={labelClass}>
            Rope grade <span className={optionalClass}>(optional)</span>
          </label>
          <select
            value={ropeGrade}
            onChange={(e) => setRopeGrade(e.target.value)}
            className={`${inputBase} mt-1`}
          >
            <option value="">— None (bouldering) —</option>
            {ROPE_GRADES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Send type + attempts */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Send type</label>
          <select
            value={sendType}
            onChange={(e) => setSendType(e.target.value as SendType)}
            className={`${inputBase} mt-1`}
          >
            {SEND_TYPES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label} — {s.hint}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Attempts</label>
          <input
            type="number"
            min={0}
            value={isFlash ? 1 : attemptCount}
            disabled={isFlash}
            onChange={(e) => setAttemptCount(Math.max(0, Number(e.target.value)))}
            className={`${inputBase} mt-1 disabled:opacity-60`}
          />
          {isFlash && (
            <p className="mt-1 text-xs text-muted">A flash is one attempt.</p>
          )}
        </div>
      </div>

      {/* Date + visibility */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Date</label>
          <input
            type="datetime-local"
            value={climbedAt}
            onChange={(e) => setClimbedAt(e.target.value)}
            className={`${inputBase} mt-1`}
          />
        </div>
        <div>
          <label className={labelClass}>Visibility</label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as Visibility)}
            className={`${inputBase} mt-1`}
          >
            <option value="PRIVATE">Private (only me)</option>
            <option value="PUBLIC">Public (other users can see)</option>
          </select>
        </div>
      </div>

      {/* Comments */}
      <div>
        <label className={labelClass}>
          Comments <span className={optionalClass}>(optional)</span>
        </label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={3}
          className={`${inputBase} mt-1`}
          placeholder="Beta, how it felt, etc."
        />
      </div>

      {/* Media */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MediaUpload kind="photo" value={photoPath} onChange={setPhotoPath} />
        <MediaUpload kind="video" value={videoPath} onChange={setVideoPath} />
      </div>

      {formError && (
        <p className="rounded-md border border-ember/40 bg-ember/10 px-3 py-2 text-sm text-ember">
          {formError}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving ? "Saving…" : isEdit ? "Save changes" : "Log climb"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className={btnSecondary}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
