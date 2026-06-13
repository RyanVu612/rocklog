"use client";

import Link from "next/link";
import { useState } from "react";

import { ClimbCard } from "~/app/_components/climb-card";
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
  const selectClass =
    "rounded-md border border-slate-300 px-2 py-1.5 text-sm";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-2 rounded-lg border border-slate-200 bg-white p-3">
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
          className="ml-auto rounded-md px-2 py-1.5 text-sm text-slate-500 hover:bg-slate-100"
        >
          Reset
        </button>
      </div>

      {climbsQuery.isLoading ? (
        <p className="py-8 text-center text-slate-500">Loading climbs…</p>
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
      <span className="text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function EmptyState({ anyFilter }: { anyFilter: boolean }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white py-12 text-center">
      {anyFilter ? (
        <p className="text-slate-500">No climbs match these filters.</p>
      ) : (
        <>
          <p className="text-slate-600">You haven&apos;t logged any climbs yet.</p>
          <Link
            href="/climbs/new"
            className="mt-3 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Log your first climb
          </Link>
        </>
      )}
    </div>
  );
}
