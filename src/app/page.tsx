import Link from "next/link";

import { ClimbList } from "~/app/_components/climb-list";
import { Landing } from "~/app/_components/landing";
import { btnPrimary } from "~/app/_components/ui";
import { getServerAuthSession } from "~/server/auth";

// This page reads the session per-request.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerAuthSession();

  if (!session) {
    return <Landing />;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl uppercase tracking-tight text-ink">
          My Climbs
        </h1>
        <Link href="/climbs/new" className={`${btnPrimary} text-sm`}>
          Log a climb
        </Link>
      </div>
      <ClimbList />
    </div>
  );
}
