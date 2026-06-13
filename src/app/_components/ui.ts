// Shared Rocklog UI class sets so buttons, inputs, and chips look consistent
// across every screen. Plain string constants so Tailwind's content scanner
// still picks the classes up.

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

/** Primary action — Log a climb / Submit / Start logging. */
export const btnPrimary = `inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-on-primary transition hover:opacity-90 disabled:opacity-50 ${focusRing}`;

/** Secondary / outline action — Cancel / New gym. */
export const btnSecondary = `inline-flex items-center justify-center gap-2 rounded-md border border-edge bg-transparent px-4 py-2 font-medium text-ink transition hover:bg-panel disabled:opacity-50 ${focusRing}`;

/** Quiet text action — Reset / Sign out. */
export const btnGhost = `inline-flex items-center justify-center gap-2 rounded-md px-2 py-1.5 text-muted transition hover:bg-panel hover:text-ink ${focusRing}`;

/** Destructive action — Delete. */
export const btnDanger = `inline-flex items-center justify-center gap-2 rounded-md border border-ember/50 px-4 py-2 font-medium text-ember transition hover:bg-ember/10 disabled:opacity-50 ${focusRing}`;

/** Solid destructive confirm — Yes, delete. */
export const btnDangerSolid = `inline-flex items-center justify-center gap-2 rounded-md bg-ember px-3 py-1.5 font-medium text-chalk transition hover:opacity-90 disabled:opacity-50 ${focusRing}`;

/** Text inputs, selects, textareas. */
export const inputBase = `w-full rounded-md border border-edge bg-panel px-3 py-2 text-ink placeholder:text-muted transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold`;

/** Neutral chip (color label, rope grade). */
export const chipNeutral =
  "rounded bg-panel px-2 py-0.5 text-xs text-muted ring-1 ring-edge";
