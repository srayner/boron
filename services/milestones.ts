import { prisma } from "@/lib/prisma";
import { MilestoneStatus } from "@prisma/client";
import { AppError } from "@/lib/api/error";
import { processTagsForCreate, processTagsForUpdate } from "@/services/tags";
import { updateSearchIndex, deleteSearchIndex } from "./search";

const openStatuses: MilestoneStatus[] = ["PLANNED", "IN_PROGRESS", "ON_HOLD"];
const closeStatuses: MilestoneStatus[] = ["COMPLETED", "CANCELLED"];

export const createMilestone = async (data: any) => {
  if (!data.name) throw new AppError("Milestone name is required", 422);

  const dueDate = data.dueDate ? new Date(data.dueDate) : null;

  if (dueDate && isNaN(dueDate.getTime())) {
    throw new AppError("Invalid due date", 422);
  }

  const tags = data.tags
    ? await processTagsForCreate(data.tags)
    : { connect: [] };

  const newMilestone = await prisma.milestone.create({
    data: {
      projectId: data.projectId,
      name: data.name,
      description: data.description || "",
      order: data.order,
      status: data.status,
      dueDate: dueDate,
      tags,
    },
    include: { tags: true },
  });

  updateSearchIndex("milestone", newMilestone);

  return newMilestone;
};

export const deleteMilestone = async (id: string) => {
  const deletedMilestone = await prisma.milestone.delete({
    where: { id },
  });

  deleteSearchIndex("milestone", id);

  return deletedMilestone;
};

export const updateMilestone = async (id: string, data: any) => {
  if (!data.name) throw new AppError("Milestone name is required", 422);

  const dueDate = data.dueDate ? new Date(data.dueDate) : null;

  if (dueDate && isNaN(dueDate.getTime())) {
    throw new AppError("Invalid due date", 422);
  }

  const tags = data.tags ? await processTagsForUpdate(data.tags) : { set: [] };

  const updatedMilestone = await prisma.milestone.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description || "",
      order: data.order,
      status: data.status,
      dueDate: dueDate,
      tags,
    },
    include: { tags: true },
  });

  updateSearchIndex("milestone", updatedMilestone);

  return updatedMilestone;
};

export const getMilestone = async (id: string) => {
  return await prisma.milestone.findUnique({
    where: { id },
    include: {
      project: true,
      tasks: true,
      tags: true,
    },
  });
};

export async function getMilestones(params: {
  search: string;
  projectId?: string;
  dueDate?: { lt?: Date; gt?: Date };
  dueDateFilter?: "with" | "without";
  statusFilter?: "open" | "closed";
  pagination: { take: number; skip: number };
  ordering: { [key: string]: "asc" | "desc" };
}) {
  const where = {
    name: { contains: params.search },
    ...(params.projectId && { projectId: params.projectId }),
    ...(params.dueDate && { dueDate: params.dueDate }),
    ...(params.dueDateFilter === "with" && { dueDate: { not: null } }),
    ...(params.dueDateFilter === "without" && { dueDate: null }),
    ...(params.statusFilter === "open" && { status: { in: openStatuses } }),
    ...(params.statusFilter === "closed" && { status: { in: closeStatuses } }),
  };

  const [milestones, totalCount] = await Promise.all([
    prisma.milestone.findMany({
      include: {
        project: true,
        tasks: true,
      },
      where,
      orderBy: params.ordering,
      take: params.pagination.take,
      skip: params.pagination.skip,
    }),
    prisma.task.count({ where }),
  ]);

  return { milestones, totalCount };
}

export async function getSummary() {
  const now = new Date();

  const { milestones } = await getMilestones({
    search: "",
    pagination: { take: 5, skip: 0 },
    ordering: { dueDate: "asc" },
    statusFilter: "open",
    dueDate: { gt: now },
  });

  const [hasAny, hasCompleted, hasUndatedOpen, overdueCount] =
    await Promise.all([
      prisma.milestone.count().then((c) => c > 0),
      prisma.milestone
        .count({ where: { status: "COMPLETED" } })
        .then((c) => c > 0),
      prisma.milestone
        .count({
          where: {
            status: { in: openStatuses },
            dueDate: null,
          },
        })
        .then((c) => c > 0),
      prisma.milestone.count({
        where: {
          status: { in: openStatuses },
          dueDate: { lt: now },
        },
      }),
    ]);

  return {
    milestones,
    summary: {
      hasAnyMilestones: hasAny,
      hasCompletedMilestones: hasCompleted,
      hasUndatedOpenMilestones: hasUndatedOpen,
      hasUpcomingMilestones: milestones.length > 0,
      overdueCount,
    },
  };
}

export async function updateMilestoneProgress(milestoneId: string) {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    select: { status: true },
  });

  if (!milestone) return;

  const tasks = await prisma.task.findMany({
    where: { milestoneId },
    select: { progress: true },
  });

  const total = tasks.reduce((sum, t) => sum + t.progress.toNumber(), 0);
  const progress = tasks.length > 0 ? Math.floor(total / tasks.length) : 0;

  let newStatus = milestone.status;
  if (milestone.status !== "ON_HOLD" && milestone.status !== "CANCELLED") {
    newStatus = "IN_PROGRESS";
    if (progress === 100) {
      newStatus = "COMPLETED";
    }
    if (progress === 0) {
      newStatus = "PLANNED";
    }
  }

  await prisma.milestone.update({
    where: { id: milestoneId },
    data: { progress, status: newStatus, updatedAt: new Date() },
  });
}
