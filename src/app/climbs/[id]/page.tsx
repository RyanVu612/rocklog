import { TRPCError } from "@trpc/server";
import { notFound, redirect } from "next/navigation";

import { ClimbDetail } from "~/app/_components/climb-detail";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export const dynamic = "force-dynamic";

export default async function ClimbDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerAuthSession();
  if (!session) redirect("/");

  try {
    const climb = await api.climb.byId({ id: params.id });
    return <ClimbDetail climb={climb} />;
  } catch (e) {
    if (e instanceof TRPCError && e.code === "NOT_FOUND") notFound();
    throw e;
  }
}
