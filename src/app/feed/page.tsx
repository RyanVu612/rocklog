import { redirect } from "next/navigation";

import { ClimbCard } from "~/app/_components/climb-card";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const session = await getServerAuthSession();
  if (!session) redirect("/");

  const climbs = await api.climb.publicList();

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl uppercase tracking-tight text-ink">
        Public feed
      </h1>
      {climbs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-edge bg-panel py-12 text-center text-muted">
          No public climbs from other users yet.
        </div>
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
