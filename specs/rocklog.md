# Rocklog — Spec

## Objective

Rocklog is a personal web application for logging rock climbs done at climbing
gyms. It is a fresh, web-based rebuild of an earlier iOS app (rebuilt as a web
app to avoid the Apple App Store developer fee). The primary user is the author;
friends may also use it, and it may later open to a wider audience (out of scope
for v1).

Success means: the author can sign in, log a climb (grade, send type, gym,
optional photo/video, comments, date, visibility) in well under a minute, and
later browse, filter, sort, edit, and delete those climbs reliably. Friends can
do the same with their own accounts. Each climb can be marked public or private.

## Requirements

### Must-have

1. **Tech stack.** Built on the T3 stack: Next.js (App Router), TypeScript,
   tRPC, Prisma, and Tailwind CSS. Authentication via NextAuth (Auth.js).
   Deployed to Vercel. Database is Supabase Postgres. Media stored in Supabase
   Storage.
2. **Authentication.** Sign-in via OAuth provider(s) (Google and/or GitHub)
   through NextAuth. Unauthenticated users cannot log, edit, or delete climbs.
   Each user has their own account and owns the climbs they create.
3. **Log a climb.** A signed-in user can create a climb entry with these fields:
   - **Grade range (required):** a V-scale range expressed as a minimum and
     maximum V grade (e.g. V3–V5). A single grade is expressed as min == max
     (e.g. V4–V4). Supported V grades: V0 through V17 (and "VB"/V-Beginner is
     optional; if omitted, V0 is the floor).
   - **Rope grade (optional):** a YDS rope grade (e.g. 5.10a). Bouldering is the
     default; the rope grade field is optional and may be left empty.
   - **Color label (optional):** a free-text or selectable color label shown
     next to the grade (e.g. "Pink", "Green").
   - **Send type (required):** one of **Flash** (sent first try), **Send**
     (a.k.a. Redpoint — sent after attempts), or **Project** (attempted, not yet
     sent).
   - **Attempt count (optional):** an integer number of attempts. Defaults
     sensibly (e.g. 1 for Flash). Stored with the climb.
   - **Photo (optional):** a single image uploaded to Supabase Storage.
   - **Video (optional):** a single short video uploaded to Supabase Storage,
     subject to a size/length limit (see Constraints).
   - **Comments (optional):** free-text notes.
   - **Date (required):** defaults to the current date/time when the form opens,
     and is editable by the user.
   - **Visibility (required):** a per-climb public/private toggle. Defaults to a
     defined value (private unless changed).
4. **Gym (managed list).** Each climb references a gym chosen from a managed
   list of gyms.
   - The user selects a gym from existing approved gyms.
   - If their gym is not in the list, the user can submit a new gym. The new gym
     is created in a **pending** state and is **immediately usable** — the user
     can log climbs against it right away, and it appears as their gym.
   - Pending gyms are reviewed and **approved by editing the database directly**
     (e.g. via Prisma Studio / Supabase). No in-app admin UI is required for v1.
   - If a pending gym is **declined/deleted**, every climb that referenced it is
     **reassigned to a default "Unknown" gym** (no climbs are lost). The
     "Unknown" gym always exists and cannot be deleted.
5. **Browse with filtering & sorting.** A signed-in user can view a list of
   climbs and filter/sort them. At minimum:
   - **Filter** by gym, send type, and grade.
   - **Sort** by date (which provides the chronological / most-recent-first
     view), and by grade.
   - The default list view shows the user's climbs most-recent-first.
6. **Visibility enforcement.** A user always sees all of their own climbs
   (public and private). Climbs another user marked **private** are never shown
   to anyone else; climbs marked **public** may be visible to other signed-in
   users. (Public/anonymous, signed-out browsing is out of scope for v1.)
7. **Edit a climb.** The owner can edit any field of a climb they created,
   including changing the grade, adding a video later, changing the gym, and
   toggling visibility. All fields are editable.
8. **Delete a climb.** The owner can delete a climb they created. Deleting a
   climb also **removes its associated photo/video from Supabase Storage** so no
   orphaned media remains.
9. **Ownership & authorization.** Only the owner of a climb can edit or delete
   it. tRPC procedures enforce that the caller owns the climb being mutated.

### Nice-to-have (explicitly deferred — not part of v1 "done")

10. Stats / progress dashboards (sends by grade, hardest send, climbs over time).
11. Public / signed-out browsing and a broader public launch.
12. Social feed and comments on other users' climbs.
13. In-app admin UI for approving/declining gyms.
14. Native mobile app.
15. Onsight / Repeat or other additional send types beyond Flash/Send/Project.

## Constraints

- **Stack must be T3:** Next.js (App Router) + TypeScript + tRPC + Prisma +
  Tailwind + NextAuth. Do not introduce a different framework.
- **Hosting:** must run on Vercel's free hobby tier; data on Supabase free tier;
  media on Supabase Storage free tier. Stay within free-tier-friendly limits.
- **Media limits:** enforce a reasonable upload size limit to stay within free
  tiers — images capped (e.g. ≤ 10 MB) and videos capped in size/length
  (e.g. ≤ 50 MB / short clips). Reject uploads over the limit with a clear error.
- **Type safety:** end-to-end type safety via tRPC + Prisma; no use of `any` for
  core climb/gym/user models.
- **Secrets:** OAuth client secrets, the database URL, and Supabase service keys
  live in environment variables only and must never be committed. Provide a
  `.env.example` listing required variables with placeholder values.
- **Privacy:** private climbs must not leak to other users through any list,
  filter, detail, or API response.
- **No destructive defaults:** declining a gym must not delete climbs; it
  reassigns them to "Unknown".
- **Git hygiene:** `node_modules`, build output (`.next`), local env files, and
  any generated artifacts are gitignored and not committed.

## Edge Cases

- **Invalid grade range:** max grade lower than min grade is rejected with a
  validation error.
- **No media:** a climb with neither photo nor video is valid and displays a
  sensible placeholder.
- **Oversized / wrong-type upload:** files over the size limit or of an
  unsupported type are rejected with a clear message; no partial record is left.
- **Upload fails mid-create:** if media upload fails, the climb is either not
  created or is created without the failed media (no broken media reference).
- **Duplicate gym submission:** submitting a gym whose name already exists
  (approved or pending, case-insensitive) reuses the existing gym rather than
  creating a duplicate.
- **Pending gym in use when declined:** declining/deleting a pending gym
  reassigns all referencing climbs to "Unknown" and does not error or orphan
  climbs.
- **Unauthorized mutation:** a user attempting to edit/delete a climb they do
  not own receives an authorization error and no change occurs.
- **Viewing others' private climbs:** requesting a private climb owned by
  someone else (by id or via any list) returns not-found / is excluded.
- **Empty state:** a new user with no climbs sees an empty-state prompt, not an
  error.
- **Attempt count vs send type:** Flash with attempt count > 1 is either
  prevented or normalized; Project may have 0 sends.
- **Deleting a climb with media:** media is removed from storage; if storage
  deletion fails, the failure is handled (logged/retried) without leaving the DB
  inconsistent.

## Definition of Done

A reviewer can verify each of the following:

1. The project is a T3 app (Next.js App Router, TypeScript, tRPC, Prisma,
   Tailwind, NextAuth) that installs and builds with documented commands
   (`npm install`, `npm run build`) without errors.
2. A `.env.example` exists listing every required environment variable
   (database URL, NextAuth/OAuth secrets, Supabase keys) with placeholders, and
   no real secrets are committed.
3. The Prisma schema defines models for **User**, **Climb**, and **Gym** (with a
   gym status/approval field and an enforced default "Unknown" gym), and
   migrates cleanly against Postgres.
4. A signed-in user can create a climb with all specified fields; the climb is
   persisted and appears in their list.
5. Grade range validation rejects max < min; the "no media" climb is accepted;
   oversized/invalid uploads are rejected with a clear message.
6. Submitting a new gym creates it as pending and lets the user log against it
   immediately; submitting an existing gym name does not create a duplicate.
7. Reassignment works: deleting/declining a gym moves its climbs to "Unknown"
   and loses no climbs (verifiable via a test or a documented manual check).
8. The list view supports filtering by gym, send type, and grade, and sorting by
   date and grade, with most-recent-first as the default.
9. A user sees all their own climbs; another user's private climbs never appear
   in any list, filter result, or detail fetch (verifiable via test or manual
   two-account check).
10. The owner can edit every field of their climb and delete the climb; on
    delete, the associated media is removed from Supabase Storage.
11. A non-owner cannot edit or delete a climb (procedure returns an authorization
    error).
12. `node_modules`, `.next`, and env files are gitignored; the repo contains no
    committed secrets or build artifacts.
13. A README documents setup: install, env vars, Supabase/OAuth configuration,
    running locally, running the build, and deploying to Vercel.

## Open Questions

- **Video length limit:** exact cap not specified by the user; spec assumes a
  conservative size/length limit (~50 MB / short clips) to stay within free
  tiers. Confirm if a different limit is desired.
- **OAuth provider choice:** Google vs GitHub (or both) not finalized; either
  satisfies the "OAuth" requirement.
