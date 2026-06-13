import Link from "next/link";

import { ClimbList } from "~/app/_components/climb-list";
import { SignInButton } from "~/app/_components/sign-in-button";
import { getServerAuthSession } from "~/server/auth";

// This page reads the session per-request.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerAuthSession();

  if (!session) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-10 text-center">
        <h1 className="text-2xl font-bold">Log your climbs.</h1>
        <p className="mx-auto mt-2 max-w-md text-slate-600">
          Rocklog is a simple log for the boulders and routes you send at the
          gym — grade, send type, photos, and notes, all in one place.
        </p>
        <div className="mt-6">
          <SignInButton />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">My Climbs</h1>
        <Link
          href="/climbs/new"
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          Log a climb
        </Link>
      </div>
      <ClimbList />
    </div>
  );
}
