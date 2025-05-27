import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/api/error";
import { processTagsForCreate, processTagsForUpdate } from "@/services/tags";

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
      milestones: true,
      tags: true,
    },
  });
};

export async function getProjects(params: {
  search: string;
  pagination: { take: number; skip: number };
  ordering: { [key: string]: "asc" | "desc" };
}) {
  return prisma.project.findMany({
    include: {
      tasks: true,
      costs: true,
      milestones: true,
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
