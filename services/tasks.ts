import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/api/error";
import { processTagsForCreate, processTagsForUpdate } from "@/services/tags";
import { Task } from "@/types/entities";

export const createTask = async (data: any) => {
  if (!data.name) throw new AppError("Task name is required", 422);

  const startDate = data.startDate ? new Date(data.startDate) : null;
  const dueDate = data.dueDate ? new Date(data.dueDate) : null;

  if (startDate && isNaN(startDate.getTime())) {
    throw new AppError("Invalid start date", 422);
  }
  if (dueDate && isNaN(dueDate.getTime())) {
    throw new AppError("Invalid due date", 422);
  }

  const tags = data.tags
    ? await processTagsForCreate(data.tags)
    : { connect: [] };

  return prisma.task.create({
    data: {
      projectId: data.projectId,
      name: data.name,
      description: data.description || "",
      status: data.status,
      priority: data.priority,
      milestoneId: data.milestoneId,
      startDate: startDate,
      dueDate: dueDate,
      tags,
    },
  });
};

export const deleteTask = async (id: string) => {
  return await prisma.task.delete({
    where: { id },
  });
};

export const updateTask = async (id: string, data: any) => {
  if (!data.name) throw new AppError("Task name is required", 422);

  const startDate = data.startDate ? new Date(data.startDate) : null;
  const dueDate = data.dueDate ? new Date(data.dueDate) : null;

  if (startDate && isNaN(startDate.getTime())) {
    throw new AppError("Invalid start date", 422);
  }
  if (dueDate && isNaN(dueDate.getTime())) {
    throw new AppError("Invalid due date", 422);
  }

  const tags = data.tags ? await processTagsForUpdate(data.tags) : { set: [] };

  return prisma.task.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description || "",
      status: data.status,
      priority: data.priority,
      progress: calculateProgress(data),
      milestoneId: data.milestoneId,
      startDate: startDate,
      dueDate: dueDate,
      tags,
    },
  });
};

export const getTask = async (id: string) => {
  return await prisma.task.findUnique({
    where: { id },
    include: {
      project: true,
      subTasks: true,
      costs: true,
      milestone: true,
      tags: true,
    },
  });
};

export async function getTasks(params: {
  search: string;
  pagination: { take: number; skip: number };
  ordering: { [key: string]: "asc" | "desc" };
}) {
  return prisma.task.findMany({
    include: {
      project: true,
      subTasks: true,
      costs: true,
      milestone: true,
    },
    where: {
      name: {
        contains: params.search,
      },
    },
    orderBy: params.ordering,
    take: params.pagination.take,
    skip: params.pagination.skip,
  });
}

function calculateProgress(update: Task): number {
  if (update.status === "COMPLETED") {
    return 100;
  }

  if (update.status === "IN_PROGRESS") {
    return Math.min(update.progress, 99);
  }

  if (update.status === "PLANNED") {
    return 0;
  }

  return update.progress;
}
