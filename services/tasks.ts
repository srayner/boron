import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/api/error";
import { processTagsForCreate, processTagsForUpdate } from "@/services/tags";
import { Task } from "@/types/entities";
import { updateMilestoneProgress } from "./milestones";
import { updateProjectProgress } from "./projects";

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

  let completedAt = null;
  if (data.status === "COMPLETED") {
    completedAt = new Date();
  }

  const tags = data.tags
    ? await processTagsForCreate(data.tags)
    : { connect: [] };

  const newTask = await prisma.task.create({
    data: {
      projectId: data.projectId,
      name: data.name,
      description: data.description || "",
      status: data.status,
      priority: data.priority,
      progress: calculateProgress(data),
      milestoneId: data.milestoneId,
      startDate: startDate,
      dueDate: dueDate,
      completedAt,
      tags,
    },
  });

  if (newTask.milestoneId) {
    await updateMilestoneProgress(newTask.milestoneId);
  }
  await updateProjectProgress(newTask.projectId);

  return newTask;
};

export const deleteTask = async (id: string) => {
  const deletedTask = await prisma.task.delete({
    where: { id },
  });

  if (deletedTask.milestoneId) {
    await updateMilestoneProgress(deletedTask.milestoneId);
  }
  await updateProjectProgress(deletedTask.projectId);

  return deletedTask;
};

export const updateTask = async (id: string, data: any) => {
  const currentTask = await getTask(id);
  if (!currentTask) throw new AppError("Task not found", 404);

  if (!data.name) throw new AppError("Task name is required", 422);

  const startDate = data.startDate ? new Date(data.startDate) : null;
  const dueDate = data.dueDate ? new Date(data.dueDate) : null;

  if (startDate && isNaN(startDate.getTime())) {
    throw new AppError("Invalid start date", 422);
  }
  if (dueDate && isNaN(dueDate.getTime())) {
    throw new AppError("Invalid due date", 422);
  }

  let completedAt = currentTask.completedAt;
  if (data.status === "COMPLETED" && currentTask.status !== "COMPLETED") {
    completedAt = new Date();
  } else if (
    data.status !== "COMPLETED" &&
    currentTask.status === "COMPLETED"
  ) {
    completedAt = null;
  }

  const tags = data.tags ? await processTagsForUpdate(data.tags) : { set: [] };

  const updatedTask = await prisma.task.update({
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
      completedAt,
      tags,
    },
  });

  if (updatedTask.milestoneId) {
    await updateMilestoneProgress(updatedTask.milestoneId);
  }
  await updateProjectProgress(updatedTask.projectId);

  return updatedTask;
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
  dueDateFilter?: "with" | "without";
  pagination: { take: number; skip: number };
  ordering: { [key: string]: "asc" | "desc" };
}) {
  const where = {
    name: { contains: params.search },
    ...(params.dueDateFilter === "with" && { dueDate: { not: null } }),
    ...(params.dueDateFilter === "without" && { dueDate: null }),
  };

  const [tasks, totalCount] = await Promise.all([
    prisma.task.findMany({
      include: {
        project: true,
        subTasks: true,
        costs: true,
        milestone: true,
      },
      where,
      orderBy: params.ordering,
      take: params.pagination.take,
      skip: params.pagination.skip,
    }),
    prisma.task.count({ where }),
  ]);

  return { tasks, totalCount };
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
