import { PrismaClient } from "@prisma/client";
import { updateSearchIndex } from "@/services/search";

const prisma = new PrismaClient();

async function backfillSearchIndex() {
  console.log("Backfilling Projects...");
  const projects = await prisma.project.findMany({
    include: { tags: true },
  });
  for (const project of projects) {
    await updateSearchIndex("project", project);
  }

  console.log("Backfilling Tasks...");
  const tasks = await prisma.task.findMany({
    include: { tags: true },
  });
  for (const task of tasks) {
    await updateSearchIndex("task", task);
  }

  console.log("Backfilling Milestones...");
  const milestones = await prisma.milestone.findMany({
    include: { tags: true },
  });
  for (const milestone of milestones) {
    await updateSearchIndex("milestone", milestone);
  }

  console.log("Backfilling Costs...");
  const costs = await prisma.cost.findMany({
    include: { tags: true },
  });
  for (const cost of costs) {
    await updateSearchIndex("cost", cost);
  }

  console.log("Backfill complete.");
}

backfillSearchIndex()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
