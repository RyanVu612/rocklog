/**
 * V-scale helpers. Grades are stored as integers 0..17 (V0..V17). A climb has a
 * range [gradeMin, gradeMax]; a single grade is min == max (spec requirement 3).
 */
export const V_GRADE_MIN = 0;
export const V_GRADE_MAX = 17;

export const V_GRADES: number[] = Array.from(
  { length: V_GRADE_MAX - V_GRADE_MIN + 1 },
  (_, i) => V_GRADE_MIN + i,
);

/** Format a single V value, e.g. 4 -> "V4". */
export function formatVGrade(value: number): string {
  return `V${value}`;
}

/** Format a range, collapsing equal endpoints, e.g. (3,5) -> "V3–V5", (4,4) -> "V4". */
export function formatGradeRange(min: number, max: number): string {
  if (min === max) return formatVGrade(min);
  return `${formatVGrade(min)}–${formatVGrade(max)}`;
}

/** YDS rope grades for the optional rope-grade selector. */
export const ROPE_GRADES: string[] = [
  "5.5",
  "5.6",
  "5.7",
  "5.8",
  "5.9",
  "5.10a",
  "5.10b",
  "5.10c",
  "5.10d",
  "5.11a",
  "5.11b",
  "5.11c",
  "5.11d",
  "5.12a",
  "5.12b",
  "5.12c",
  "5.12d",
  "5.13a",
  "5.13b",
  "5.13c",
  "5.13d",
  "5.14a",
  "5.14b",
  "5.14c",
  "5.14d",
  "5.15a",
  "5.15b",
  "5.15c",
  "5.15d",
];
