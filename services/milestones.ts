import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/api/error";
import { MilestoneStatus } from "@/types/entities";

export const createMilestone = async (data: any) => {
  if (!data.name) throw new AppError("Milestone name is required", 422);

  const dueDate = data.dueDate ? new Date(data.dueDate) : null;

  if (dueDate && isNaN(dueDate.getTime())) {
    throw new AppError("Invalid due date", 422);
  }

  return prisma.milestone.create({
    data: {
      projectId: data.projectId,
      name: data.name,
      description: data.description || "",
      order: data.order,
      status: data.status,
      dueDate: dueDate,
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

  return prisma.milestone.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description || "",
      order: data.order,
      status: data.status,
      dueDate: dueDate,
    },
  });
};

export const getMilestone = async (id: string) => {
  return await prisma.milestone.findUnique({
    where: { id },
    include: {
      project: true,
      tasks: true,
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
