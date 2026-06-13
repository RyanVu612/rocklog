import { redirect } from "next/navigation";

import { ClimbForm } from "~/app/_components/climb-form";
import { getServerAuthSession } from "~/server/auth";

export const dynamic = "force-dynamic";

export default async function NewClimbPage() {
  const session = await getServerAuthSession();
  if (!session) redirect("/");

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl uppercase tracking-tight text-ink">
        Log a climb
      </h1>
      <ClimbForm />
    </div>
  );
}
