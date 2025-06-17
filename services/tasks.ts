import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
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

function getTaskCountOverTime(
  column: "createdAt" | "completedAt",
  groupBy: "day" | "month",
  startDate: Date,
  endDate: Date
) {
  const format = groupBy === "month" ? "%Y-%m" : "%Y-%m-%d";

  const columnName = column === "createdAt" ? "createdAt" : "completedAt";

  return prisma
    .$queryRawUnsafe<{ date: string; count: bigint }[]>(
      `
    SELECT
      DATE_FORMAT(${columnName}, '${format}') AS date,
      CAST(COUNT(*) AS UNSIGNED) AS count
    FROM \`Task\`
    WHERE ${columnName} IS NOT NULL
      AND ${columnName} BETWEEN ? AND ?
    GROUP BY date
    ORDER BY date ASC
  `,
      startDate,
      endDate
    )
    .then((results) =>
      results.map((r) => ({
        date: r.date,
        count: Number(r.count),
      }))
    );
}

export async function getCreatedAndCompletedTasksOverTime(
  groupBy: "day" | "month",
  startDate: Date,
  endDate: Date
) {
  const [created, completed] = await Promise.all([
    getTaskCountOverTime("createdAt", groupBy, startDate, endDate),
    getTaskCountOverTime("completedAt", groupBy, startDate, endDate),
  ]);

  const allDates = new Set([...created, ...completed].map((d) => d.date));

  return Array.from(allDates)
    .sort()
    .map((date) => ({
      date,
      created: created.find((d) => d.date === date)?.count ?? 0,
      completed: completed.find((d) => d.date === date)?.count ?? 0,
    }));
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
