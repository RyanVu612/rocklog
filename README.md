# 🧗 Rocklog

A personal web app for logging the climbs you send at the gym — grade, send
type, gym, photos/video, and notes. Built on the [T3 Stack](https://create.t3.gg/):
Next.js (App Router), TypeScript, tRPC, Prisma, Tailwind CSS, and NextAuth
(Auth.js), deployed to Vercel with a Supabase Postgres database and Supabase
Storage for media.

See [`specs/rocklog.md`](specs/rocklog.md) for the full specification.

## Features

- Sign in with Google or GitHub (OAuth).
- Log a climb: V-scale **grade range**, optional rope grade, optional color
  label, **send type** (Flash / Send / Project) with attempt count, optional
  photo and video, comments, date (defaults to now), and a **public/private**
  toggle.
- Choose a gym from a managed list, or submit a new one — new gyms are usable
  immediately and reviewed before joining the shared list.
- Browse your climbs with **filtering** (gym, send type, grade) and **sorting**
  (date, grade); newest-first by default.
- A **public feed** of climbs other users marked public.
- Edit and delete your own climbs; deleting also removes the media from storage.
- Private climbs are never visible to other users.

## Tech stack & versions

- Next.js `14.2.x` (pinned to 14 for Node 18.17 compatibility), React 18
- tRPC v11, TanStack Query v5
- Prisma v5 + PostgreSQL (Supabase)
- NextAuth v4 (`@next-auth/prisma-adapter`)
- Supabase Storage (signed upload/download URLs)

> **Node:** requires Node `>=18.17`. (Next 15 needs Node 18.18+, so this project
> stays on Next 14 to match the local toolchain.)

## Prerequisites

1. A [Supabase](https://supabase.com) project (free tier) for Postgres + Storage.
2. An OAuth app for **Google** and/or **GitHub** (at least one).
3. Node 18.17+ and npm.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#   then fill in real values (see "Environment variables" below)

# 3. Generate the Prisma client + create the database schema
npm run db:generate
npm run db:migrate        # creates tables in your Supabase Postgres

# 4. Seed the default "Unknown" gym (required for gym reassignment)
npm run db:seed

# 5. Run the app
npm run dev               # http://localhost:3000
```

### Supabase Storage bucket

Create a **private** Storage bucket named `climb-media` (or whatever you set in
`SUPABASE_MEDIA_BUCKET`):

1. Supabase dashboard → **Storage** → **New bucket** → name `climb-media`,
   leave **Public** off.
2. (Recommended) set a per-file size limit on the bucket (e.g. 50 MB) to match
   the app's limits.

The app uploads via **signed upload URLs** minted server-side with the service
role key, and displays media via short-lived **signed download URLs**, so the
bucket can stay private. No extra RLS policies are required for this flow.

### Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Supabase pooled connection string (runtime). |
| `DIRECT_URL` | Supabase direct connection (used by Prisma Migrate). |
| `NEXTAUTH_SECRET` | NextAuth session secret (`openssl rand -base64 32`). |
| `NEXTAUTH_URL` | App URL (`http://localhost:3000` locally). |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth (optional). |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth (optional). |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (browser uploads). |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only.** Signs uploads, deletes media. |
| `SUPABASE_MEDIA_BUCKET` | Storage bucket name (default `climb-media`). |

Configure at least one OAuth provider. OAuth redirect/callback URL:
`<NEXTAUTH_URL>/api/auth/callback/<google|github>`.

> **Never commit `.env`.** Only `.env.example` belongs in git.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server. |
| `npm run build` | `prisma generate` + production build. |
| `npm run start` | Start the production server. |
| `npm run typecheck` | TypeScript check. |
| `npm run lint` | ESLint. |
| `npm run db:migrate` | Create/apply a dev migration. |
| `npm run db:deploy` | Apply migrations (production). |
| `npm run db:studio` | Open Prisma Studio (used to approve gyms). |
| `npm run db:seed` | Seed the default "Unknown" gym. |
| `npm run gym:decline -- <gymId>` | Safely decline a gym (reassign climbs → Unknown, then delete). |

## Approving / declining submitted gyms

There is no in-app admin UI (by design for v1). Manage gyms by editing the
database directly with Prisma Studio:

```bash
npm run db:studio
```

- **Approve a gym:** open the `Gym` table, set its `status` to `APPROVED`.
- **Decline a gym:** run the safe decline script, which reassigns the gym's
  climbs to `Unknown` and deletes the gym in one transaction (no climb is lost
  or orphaned, and the `Unknown` gym is protected):

  ```bash
  npm run gym:decline -- <gymId>
  ```

  Find the `<gymId>` in Prisma Studio's `Gym` table. The script refuses to
  delete the `Unknown` gym and creates `Unknown` automatically if it is missing.

(The "Unknown" gym is also created by `npm run db:seed` and must always exist.)

## Deploying to Vercel

1. Push this repo to GitHub and import it into [Vercel](https://vercel.com).
2. Add all environment variables from `.env.example` in the Vercel project
   settings. Set `NEXTAUTH_URL` to your deployed URL.
3. Add the Vercel URL's OAuth callback to your Google/GitHub OAuth app.
4. Run migrations against Supabase before/at deploy: `npm run db:deploy`
   (and `npm run db:seed` once to create the "Unknown" gym).
5. Vercel runs `npm run build` automatically.

## Media limits

- Photos ≤ 10 MB; videos ≤ 50 MB (enforced in the browser before upload, and
  recommended as a bucket-level limit in Supabase).
