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
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      tasks: true,
      costs: true,
      milestones: true,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
};
