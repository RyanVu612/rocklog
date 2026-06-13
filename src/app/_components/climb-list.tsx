"use client";

import Link from "next/link";
import { useState } from "react";

import { ClimbCard } from "~/app/_components/climb-card";
import { btnGhost, btnPrimary, inputBase } from "~/app/_components/ui";
import { SEND_TYPES } from "~/lib/constants";
import { V_GRADES, formatVGrade } from "~/lib/grades";
import { api } from "~/trpc/react";

type SendType = "FLASH" | "SEND" | "PROJECT";
type SortBy = "date" | "grade";
type SortDir = "asc" | "desc";

export function ClimbList() {
  const [gymId, setGymId] = useState("");
  const [sendType, setSendType] = useState<SendType | "">("");
  const [gradeMin, setGradeMin] = useState<number | "">("");
  const [gradeMax, setGradeMax] = useState<number | "">("");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const gymsQuery = api.gym.list.useQuery();
  const climbsQuery = api.climb.list.useQuery({
    gymId: gymId || undefined,
    sendType: sendType || undefined,
    gradeMin: gradeMin === "" ? undefined : gradeMin,
    gradeMax: gradeMax === "" ? undefined : gradeMax,
    sortBy,
    sortDir,
  });

  const climbs = climbsQuery.data ?? [];
  const selectClass = `${inputBase} px-2 py-1.5 text-sm`;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-2 rounded-lg border border-edge bg-panel p-3">
        <Filter label="Gym">
          <select
            value={gymId}
            onChange={(e) => setGymId(e.target.value)}
            className={selectClass}
          >
            <option value="">All gyms</option>
            {(gymsQuery.data ?? []).map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </Filter>

        <Filter label="Send type">
          <select
            value={sendType}
            onChange={(e) => setSendType(e.target.value as SendType | "")}
            className={selectClass}
          >
            <option value="">All</option>
            {SEND_TYPES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Filter>

        <Filter label="Grade ≥">
          <select
            value={gradeMin}
            onChange={(e) =>
              setGradeMin(e.target.value === "" ? "" : Number(e.target.value))
            }
            className={selectClass}
          >
            <option value="">Any</option>
            {V_GRADES.map((v) => (
              <option key={v} value={v}>
                {formatVGrade(v)}
              </option>
            ))}
          </select>
        </Filter>

        <Filter label="Grade ≤">
          <select
            value={gradeMax}
            onChange={(e) =>
              setGradeMax(e.target.value === "" ? "" : Number(e.target.value))
            }
            className={selectClass}
          >
            <option value="">Any</option>
            {V_GRADES.map((v) => (
              <option key={v} value={v}>
                {formatVGrade(v)}
              </option>
            ))}
          </select>
        </Filter>

        <Filter label="Sort by">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className={selectClass}
          >
            <option value="date">Date</option>
            <option value="grade">Grade</option>
          </select>
        </Filter>

        <Filter label="Order">
          <select
            value={sortDir}
            onChange={(e) => setSortDir(e.target.value as SortDir)}
            className={selectClass}
          >
            <option value="desc">Newest / hardest first</option>
            <option value="asc">Oldest / easiest first</option>
          </select>
        </Filter>

        <button
          type="button"
          onClick={() => {
            setGymId("");
            setSendType("");
            setGradeMin("");
            setGradeMax("");
            setSortBy("date");
            setSortDir("desc");
          }}
          className={`${btnGhost} ml-auto text-sm`}
        >
          Reset
        </button>
      </div>

      {climbsQuery.isLoading ? (
        <p className="py-8 text-center text-muted">Loading climbs…</p>
      ) : climbs.length === 0 ? (
        <EmptyState anyFilter={!!(gymId || sendType || gradeMin !== "" || gradeMax !== "")} />
      ) : (
        <div className="space-y-3">
          {climbs.map((c) => (
            <ClimbCard key={c.id} climb={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function Filter({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-xs uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

function EmptyState({ anyFilter }: { anyFilter: boolean }) {
  return (
    <div className="rounded-lg border border-dashed border-edge bg-panel py-12 text-center">
      {anyFilter ? (
        <p className="text-muted">No climbs match these filters.</p>
      ) : (
        <>
          <p className="text-ink">You haven&apos;t logged any climbs yet.</p>
          <Link href="/climbs/new" className={`${btnPrimary} mt-3 text-sm`}>
            Log your first climb
          </Link>
        </>
      )}
    </div>
  );
}
