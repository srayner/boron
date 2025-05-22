import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/api/error";

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
    },
    orderBy: params.ordering,
    take: params.pagination.take,
    skip: params.pagination.skip,
  });
}
