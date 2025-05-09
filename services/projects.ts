import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/api/error";

export const createProject = async (data: any) => {
  if (!data.name) throw new AppError("Project name is required", 422);

  return prisma.project.create({
    data: {
      name: data.name,
      description: data.description || "",
    },
  });
};

export const updateProject = async (id: string, data: any) => {
  if (!data.name) throw new AppError("Project name is required", 422);

  delete data.id;

  return prisma.project.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description || "",
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

export const getProjectById = async (id: string) => {
  return await prisma.project.findUnique({
    where: { id },
    include: {
      tasks: true,
      costs: true,
      milestones: true,
    },
  });
};

export const deleteProjectById = async (id: string) => {
  return await prisma.project.delete({
    where: { id },
  });
};
