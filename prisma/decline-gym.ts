import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Safely decline (delete) a submitted gym. Reassigns every climb that
 * references it to the default "Unknown" gym, then deletes the gym — all in one
 * transaction so no climb is ever orphaned or lost (spec requirement 4 / edge
 * case "pending gym in use when declined").
 *
 * Usage:  npm run gym:decline -- <gymId>
 */
async function main() {
  const gymId = process.argv[2];
  if (!gymId) {
    console.error("Usage: npm run gym:decline -- <gymId>");
    process.exit(1);
  }

  const gym = await prisma.gym.findUnique({ where: { id: gymId } });
  if (!gym) {
    console.error(`No gym found with id ${gymId}.`);
    process.exit(1);
  }
  if (gym.isUnknown) {
    console.error('The default "Unknown" gym cannot be deleted.');
    process.exit(1);
  }

  // Ensure the Unknown gym exists (it is the reassignment target).
  let unknown = await prisma.gym.findFirst({ where: { isUnknown: true } });
  unknown ??= await prisma.gym.create({
    data: {
      name: "Unknown",
      nameKey: "unknown",
      status: "APPROVED",
      isUnknown: true,
    },
  });

  const result = await prisma.$transaction(async (tx) => {
    const reassigned = await tx.climb.updateMany({
      where: { gymId: gym.id },
      data: { gymId: unknown.id },
    });
    await tx.gym.delete({ where: { id: gym.id } });
    return reassigned.count;
  });

  console.log(
    `Declined gym "${gym.name}" (${gym.id}). Reassigned ${result} climb(s) to "Unknown".`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
