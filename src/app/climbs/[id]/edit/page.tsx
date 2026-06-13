import { TRPCError } from "@trpc/server";
import { notFound, redirect } from "next/navigation";

import { ClimbForm, toInitial } from "~/app/_components/climb-form";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export const dynamic = "force-dynamic";

export default async function EditClimbPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerAuthSession();
  if (!session) redirect("/");

  try {
    const climb = await api.climb.byId({ id: params.id });
    if (!climb.isOwner) notFound(); // only the owner may edit (spec requirement 9)

    return (
      <div>
        <h1 className="mb-4 text-xl font-bold">Edit climb</h1>
        <ClimbForm initial={toInitial(climb)} />
      </div>
    );
  } catch (e) {
    if (e instanceof TRPCError && e.code === "NOT_FOUND") notFound();
    throw e;
  }
}
