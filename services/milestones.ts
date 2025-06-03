import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/api/error";
import { MilestoneStatus } from "@/types/entities";
import { processTagsForCreate, processTagsForUpdate } from "@/services/tags";

export const createMilestone = async (data: any) => {
  if (!data.name) throw new AppError("Milestone name is required", 422);

  const dueDate = data.dueDate ? new Date(data.dueDate) : null;

  if (dueDate && isNaN(dueDate.getTime())) {
    throw new AppError("Invalid due date", 422);
  }

  const tags = data.tags
    ? await processTagsForCreate(data.tags)
    : { connect: [] };

  return prisma.milestone.create({
    data: {
      projectId: data.projectId,
      name: data.name,
      description: data.description || "",
      order: data.order,
      status: data.status,
      dueDate: dueDate,
      tags,
    },
  });
};

export const deleteMilestone = async (id: string) => {
  return await prisma.milestone.delete({
    where: { id },
  });
};

export const updateMilestone = async (id: string, data: any) => {
  if (!data.name) throw new AppError("Milestone name is required", 422);

  const dueDate = data.dueDate ? new Date(data.dueDate) : null;

  if (dueDate && isNaN(dueDate.getTime())) {
    throw new AppError("Invalid due date", 422);
  }

  const tags = data.tags ? await processTagsForUpdate(data.tags) : { set: [] };

  return prisma.milestone.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description || "",
      order: data.order,
      status: data.status,
      dueDate: dueDate,
      tags,
    },
  });
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
  pagination: { take: number; skip: number };
  ordering: { [key: string]: "asc" | "desc" };
  projectId?: string;
  statuses?: MilestoneStatus[];
  dueDate?: { lt?: Date; gt?: Date };
}) {
  return prisma.milestone.findMany({
    include: {
      project: true,
      tasks: true,
    },
    where: {
      name: {
        contains: params.search,
      },
      ...(params.projectId && { projectId: params.projectId }),
      ...(params.statuses && { status: { in: params.statuses } }),
      ...(params.dueDate && { dueDate: params.dueDate }),
    },
    orderBy: params.ordering,
    take: params.pagination.take,
    skip: params.pagination.skip,
  });
}

export async function getSummary() {
  const openStatuses: MilestoneStatus[] = ["PLANNED", "IN_PROGRESS", "ON_HOLD"];
  const now = new Date();

  const milestones = await getMilestones({
    search: "",
    pagination: { take: 5, skip: 0 },
    ordering: { dueDate: "asc" },
    statuses: openStatuses,
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
