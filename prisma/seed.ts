import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seeds the always-present, non-deletable "Unknown" gym that orphaned climbs
 * are reassigned to when a gym is declined/deleted (see specs/rocklog.md req 4).
 */
async function main() {
  const unknown = await prisma.gym.findFirst({ where: { isUnknown: true } });
  if (!unknown) {
    await prisma.gym.create({
      data: {
        name: "Unknown",
        nameKey: "unknown",
        status: "APPROVED",
        isUnknown: true,
      },
    });
    console.log('Created default "Unknown" gym.');
  } else {
    console.log('Default "Unknown" gym already exists.');
  }
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
