import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/api/error";
import { processTagsForCreate, processTagsForUpdate } from "@/services/tags";
import type { Prisma } from "@prisma/client";
import { resourceUsage } from "process";

export const createProject = async (data: any) => {
  if (!data.name) throw new AppError("Project name is required", 422);

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

  return prisma.project.create({
    data: {
      name: data.name,
      description: data.description || "",
      type: data.type,
      status: data.status,
      priority: data.priority,
      startDate: startDate,
      dueDate: dueDate,
      budget: data.budget,
      tags,
    },
  });
};

export const deleteProject = async (id: string) => {
  return await prisma.project.delete({
    where: { id },
  });
};

export const updateProject = async (id: string, data: any) => {
  if (!data.name) throw new AppError("Project name is required", 422);

  const startDate = data.startDate ? new Date(data.startDate) : null;
  const dueDate = data.dueDate ? new Date(data.dueDate) : null;

  if (startDate && isNaN(startDate.getTime())) {
    throw new AppError("Invalid start date", 422);
  }
  if (dueDate && isNaN(dueDate.getTime())) {
    throw new AppError("Invalid due date", 422);
  }

  const tags = data.tags ? await processTagsForUpdate(data.tags) : { set: [] };

  return prisma.project.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description || "",
      type: data.type,
      status: data.status,
      priority: data.priority,
      startDate: startDate,
      dueDate: dueDate,
      budget: data.budget,
      tags,
    },
  });
};

export const getProject = async (id: string) => {
  return await prisma.project.findUnique({
    where: { id },
    include: {
      tasks: { include: { milestone: true } },
      costs: true,
      milestones: { orderBy: [{ order: "asc" }, { dueDate: "asc" }] },
      tags: true,
    },
  });
};

export async function getProjects(params: {
  search: string;
  pagination: { take: number; skip: number };
  ordering: { [key: string]: "asc" | "desc" };
}) {
  const [projects, totalCount] = await Promise.all([
    prisma.project.findMany({
      include: {
        tasks: true,
        costs: true,
        milestones: true,
      },
      where: {
        name: { contains: params.search },
      },
      take: params.pagination.take,
      skip: params.pagination.skip,
      orderBy: params.ordering,
    }),
    prisma.project.count({
      where: {
        name: { contains: params.search },
      },
    }),
  ]);

  return { projects, totalCount };
}

export async function getProjectProgress() {
  type ProgressCount = { percentRange: string; count: bigint };

  const rawResults = await prisma.$queryRaw<ProgressCount[]>`
    SELECT
      CASE
        WHEN progress = 100 THEN '100'
        ELSE CONCAT(FLOOR(progress / 10) * 10, '-', FLOOR(progress / 10) * 10 + 9)
      END AS percentRange,
      COUNT(*) AS count
    FROM Project
    GROUP BY percentRange
    ORDER BY
      CASE
        WHEN percentRange = '100' THEN 10
        ELSE FLOOR(CAST(SUBSTRING_INDEX(percentRange, '-', 1) AS UNSIGNED) / 10)
      END;
  `;

  return rawResults.map((r) => ({
    percentRange: r.percentRange,
    count: Number(r.count),
  }));
}

export async function updateProjectProgress(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { status: true },
  });

  if (!project) return;

  const tasks = await prisma.task.findMany({
    where: { projectId },
    select: { progress: true },
  });

  const total = tasks.reduce((sum, t) => sum + t.progress.toNumber(), 0);
  const progress = tasks.length > 0 ? Math.floor(total / tasks.length) : 0;

  let newStatus = project.status;
  if (project.status !== "ON_HOLD" && project.status !== "CANCELLED") {
    newStatus = "IN_PROGRESS";
    if (progress === 100) {
      newStatus = "COMPLETED";
    }
    if (progress === 0) {
      newStatus = "PLANNED";
    }
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { progress, status: newStatus, updatedAt: new Date() },
  });
}

export async function updateProjectCost(projectId: string) {
  const costs = await prisma.cost.findMany({
    where: { projectId },
    select: { amount: true },
  });

  const total = costs.reduce((sum, t) => sum + t.amount.toNumber(), 0);

  await prisma.project.update({
    where: { id: projectId },
    data: { actualCost: total, updatedAt: new Date() },
  });
}

export async function getProjectCountsBy(field: Prisma.ProjectScalarFieldEnum) {
  const result = await prisma.project.groupBy({
    by: [field],
    _count: {
      _all: true,
    },
  });

  return result.map((item) => ({
    ...item,
    count: item._count._all,
  }));
}
