# Rocklog App-Wide UI Restyle — Spec

## Objective

Make the entire Rocklog web app look like one intentionally designed product by
extending the landing page's "chalk-on-basalt" visual identity to every
authenticated screen. Today the landing page (`src/app/_components/landing.tsx`
+ `landing.css`) is a distinctive dark design with a custom palette, three
typefaces, and a grade-ladder / chip / card motif, while the rest of the app
(nav bar, climb list, climb form, climb detail, feed) is generic light
slate-gray Tailwind. After this work, a user moving from the landing page into
the app should feel they are in the same product, in either a light or dark
theme of their choosing.

Success looks like: shared design tokens defined once and consumed everywhere; a
working light/dark theme toggle in the nav; and every screen restyled to the
Rocklog look with no change to existing features or data flow.

## Requirements

Must-haves:

1. **Global design tokens.** Define the landing palette and the three typefaces
   as global, reusable tokens instead of being trapped in `landing.css` and the
   `Landing` component:
   - Colors: `basalt`, `basalt-2`, `line`, `chalk`, `chalk-dim`, plus the
     accent hues `teal`, `gold`, `green`, `ember`, `violet` (values taken from
     the current `landing.css` `:root`/`.rl-root` block).
   - Fonts: a display face (Archivo Black), a body grotesque (Hanken Grotesk),
     and a mono face (JetBrains Mono), exposed as CSS variables
     (`--rl-font-display`, `--rl-font-body`, `--rl-font-mono`) and as Tailwind
     `fontFamily` keys (`display`, `body`/`sans`, `mono`).
   - Tokens are registered in `tailwind.config.ts` (`theme.extend.colors` and
     `theme.extend.fontFamily`) so they are usable as Tailwind utilities
     (e.g. `bg-basalt`, `text-chalk`, `font-display`) across the app.

2. **Theme variables that flip with light/dark.** Semantic surface/text tokens
   (background, raised surface, border, primary text, dimmed text) are defined
   as CSS custom properties on a theme root and have distinct light and dark
   values. Switching theme re-points these variables; components reference the
   semantic tokens (not hard-coded `slate-*` or raw hex) so they restyle
   automatically. The accent hues (teal/gold/green/ember/violet) may stay
   constant across themes but must remain legible on both backgrounds.

3. **Fonts loaded once, app-wide.** The three `next/font/google` fonts are
   loaded a single time at the app shell level (`layout.tsx`) and applied to the
   whole document, replacing the per-component font loading currently inside
   `landing.tsx`. The body uses the grotesque by default; display and mono are
   available via utility/variable wherever needed.

4. **Theme toggle in the nav bar.** A light/dark toggle control lives in the top
   nav (`nav-bar.tsx`) and is visible on every screen, including the landing
   page (signed in or out). Activating it switches the whole app between light
   and dark immediately.

5. **Theme selection and persistence.**
   - On a first visit with no saved preference, the initial theme follows the OS
     setting via `prefers-color-scheme`.
   - Once the user toggles, their choice is saved to `localStorage` and takes
     precedence over the OS setting on every later visit.
   - The saved/resolved theme is applied before first paint (e.g. a small
     inline script in `<head>` or equivalent) so there is **no flash** of the
     wrong theme on load.

6. **Landing page refactored onto the tokens.** `landing.tsx` / `landing.css`
   are rewired to consume the shared global tokens (no duplicate palette or
   font declarations). The landing keeps its current dark look as its dark-theme
   appearance and additionally renders correctly in a light variant, so it
   respects the theme toggle like the rest of the app. Its signature elements
   (grade ladder, eyebrow, display title, send-type legend, sample cards) remain
   visually intact.

7. **Nav bar restyled.** `nav-bar.tsx` uses the Rocklog tokens (surface, border,
   text, accent) and Rocklog type. The brand wordmark, the My Climbs / Feed
   links, the "Log a climb" primary button, and Sign in / Sign out controls all
   match the new look in both themes, including hover/active states.

8. **My Climbs page + climb list restyled.** The home page header ("My Climbs"
   + "Log a climb" button), the filter bar (`climb-list.tsx` `Filter` selects,
   Reset button), the loading state, and both empty states (no climbs yet / no
   match) use the tokens and type. Form controls (`select`) are legible and
   styled for the active theme.

9. **Climb card restyled and send-type colors unified.** `climb-card.tsx` uses
   the Rocklog card surface/border, mono grade display, and the chip styling
   from the landing. Send-type badge colors are unified to the landing palette:
   **Flash = gold, Send = green, Project = ember** (replacing the current
   amber/green/sky). The color-label, rope-grade, and "Public" chips are
   restyled consistently. The media thumbnail / placeholder fits the new look.

10. **Climb form restyled.** `climb-form.tsx` (used for both new and edit) is
    restyled: section labels, all inputs/selects/textarea, the inline "add a
    gym" panel, the error message, and the Submit / Cancel buttons follow the
    tokens and type in both themes. The primary submit button uses the Rocklog
    primary style; Cancel uses a secondary/outline style. Disabled and focus
    states are visible.

11. **Media upload restyled.** `media-upload.tsx` (file picker, busy/error/
    attached messages, Remove control, the native file button) matches the new
    surfaces, borders, and text tokens in both themes.

12. **Climb detail restyled.** `climb-detail.tsx` header (grade + chips),
    metadata line, photo/video/placeholder, comments block, and the owner
    actions (Edit, Delete, the delete-confirm row) use the tokens and type.
    The destructive Delete / "Yes, delete" actions use a clear danger treatment
    (the `ember` accent or a red danger token) and remain guarded by the
    existing confirm step.

13. **Feed page restyled.** `feed/page.tsx` heading and its empty state match
    the new look; it reuses the restyled `ClimbCard`.

14. **Consistent shared UI patterns.** Repeated elements — chips/badges, grade
    display, cards, primary/secondary/danger buttons, form inputs — look
    consistent across all screens (same radius, padding scale, border/surface
    treatment, focus ring). Where practical these are centralized (shared
    component or shared class set) rather than re-specified ad hoc per file.

15. **Accessibility preserved.** Text/background combinations meet a reasonable
    contrast bar in both themes; focus-visible outlines exist on interactive
    controls; the landing's `prefers-reduced-motion` handling is preserved; the
    theme toggle has an accessible name.

Explicitly deferred (out of scope, do **not** build):

- No new pages, routes, or features; no changes to tRPC routers, Prisma schema,
  auth, or data flow.
- No change to form fields, validation rules, or what data is logged.
- No third-party UI/component library or CSS framework swap (stay on Tailwind).
- No internationalization, no per-component theme overrides beyond light/dark.

## Constraints

- **Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS 3.4,
  tRPC, next-auth, T3 layout. Keep using Tailwind utilities as the primary
  styling mechanism; tokens promoted into `tailwind.config.ts` and
  `globals.css`. `landing.css` may remain only for landing-specific structural
  CSS, but its palette/font definitions must come from the shared tokens.
- **Fonts:** Load via `next/font/google` exactly the three current families
  (Archivo Black 400, Hanken Grotesk, JetBrains Mono) — no new font services.
- **No new runtime dependencies** unless strictly required; prefer a small
  inline script + `localStorage` + a `data-theme`/`class` on `<html>` for
  theming over adding a library. If a theming approach needs a dependency, it
  must be justified and minimal.
- **Behavior unchanged:** This is a restyle plus light layout polish (spacing,
  hierarchy, empty/loading states, responsiveness). Markup may be reorganized
  for layout, but every existing feature must keep working identically.
- **Quality gates:** `npm run typecheck`, `npm run lint`, and `npm run build`
  must all pass. (`prisma generate` runs as part of `build`.)
- **Platform:** Windows / PowerShell dev environment; commands must run there.
- **Privacy/secrets:** No secrets touched; do not commit env files, build
  output, or local DB. No data leaves the app.

## Edge Cases

- **First load, no saved theme:** resolve from `prefers-color-scheme`; render
  correctly with no flash. If `prefers-color-scheme` is unsupported, fall back
  to a defined default (dark) without error.
- **Saved theme present:** the `localStorage` value wins over OS setting on load.
- **localStorage unavailable/blocked** (private mode, disabled storage): theme
  still resolves to a default and toggling still works for the session without
  throwing.
- **SSR/hydration:** server-rendered markup must not mismatch the
  client-resolved theme in a way that throws hydration errors; the pre-paint
  script sets the theme before React hydrates.
- **Signed out (landing only):** toggle still works; landing renders in both
  themes.
- **Empty data:** "no climbs yet", "no climbs match filters", and "no public
  climbs yet" states are all styled (not unstyled fallback text).
- **Loading state:** the climb list loading message is styled to the theme.
- **Long/edge content:** long gym names, long comments (line-clamped on cards),
  and missing media (placeholder) all render cleanly in both themes.
- **Accent legibility:** gold/green/ember/teal/violet chips and text remain
  legible on both basalt (dark) and light surfaces; adjust chip text color
  (e.g. dark text on light accent fill) as needed for contrast.
- **Reduced motion:** users with `prefers-reduced-motion` see the ladder marker
  and button transitions suppressed, as today.

## Definition of Done

A reviewer can verify each of these:

1. `npm run typecheck` passes with no errors.
2. `npm run lint` passes with no new errors/warnings introduced by this work.
3. `npm run build` completes successfully.
4. `tailwind.config.ts` defines the Rocklog color tokens (basalt, basalt-2,
   line, chalk, chalk-dim, teal, gold, green, ember, violet) and the three
   `fontFamily` entries; they are usable as Tailwind utility classes.
5. The three fonts are loaded once in `layout.tsx` (not inside `landing.tsx`),
   and the document body uses the grotesque body font by default.
6. A theme toggle is present in the nav bar and visible on the landing page and
   on every authenticated screen.
7. Toggling switches the entire app (nav, list, form, detail, feed, landing)
   between a light and a dark theme; no screen remains stuck in slate-gray or
   the wrong theme.
8. With no saved preference, the app's initial theme matches the OS
   `prefers-color-scheme` setting; after toggling, reloading the page preserves
   the chosen theme (persisted in `localStorage`).
9. There is no visible flash of the wrong theme on initial page load.
10. `climb-card.tsx` shows Flash in gold, Send in green, and Project in ember;
    no `amber-*`/`sky-*` send-type classes remain.
11. No authenticated-app component still hard-codes `slate-*`, `bg-white`, or
    `text-slate-900`-style light-only colors for its surfaces/text; components
    reference the shared tokens / semantic theme variables instead. (Spot-check:
    `nav-bar.tsx`, `climb-card.tsx`, `climb-list.tsx`, `climb-form.tsx`,
    `climb-detail.tsx`, `media-upload.tsx`, `feed/page.tsx`, `page.tsx`.)
12. The landing page's palette and fonts come from the shared tokens — there are
    no duplicate hex color or font-loading declarations unique to
    `landing.tsx`/`landing.css` that the rest of the app does not share.
13. The landing's signature elements (grade ladder with climbing marker,
    eyebrow, display title with gold emphasis, send-type legend, sample cards)
    still render and remain visually intact in dark mode, and render legibly in
    light mode.
14. All existing features still work: filtering/sorting the list, creating a
    climb, adding a gym inline, uploading/removing media, editing a climb,
    deleting a climb (with confirm), and the public feed — none broken by the
    restyle.
15. Interactive controls show a visible focus-visible state, and
    `prefers-reduced-motion` still suppresses the landing animations.
16. Buttons follow a consistent system: a primary style (Log a climb / Submit /
    Start logging), a secondary/outline style (Cancel / New gym), and a danger
    style (Delete) — each looking consistent wherever it appears.
