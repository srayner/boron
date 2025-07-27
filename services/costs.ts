import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { processTagsForCreate, processTagsForUpdate } from "@/services/tags";
import { updateProjectCost } from "./projects";
import { updateSearchIndex, deleteSearchIndex } from "./search";

const CostSchema = z.object({
  amount: z.coerce.number().min(0),
  type: z.enum([
    "PARTS",
    "LABOR",
    "SOFTWARE",
    "TOOLS",
    "CONSUMABLES",
    "TRAVEL",
    "MISC",
  ]),
  name: z.string().max(80).optional(),
  description: z.string().max(2000).optional(),
  date: z.coerce.date().optional(),
  projectId: z.string().min(1),
  taskId: z.string().optional(),
});

async function validateCostInput(data: unknown) {
  const validated = CostSchema.parse(data);

  // Check project exists
  const project = await prisma.project.findUnique({
    where: { id: validated.projectId },
    select: { id: true },
  });
  if (!project) {
    throw new Error("Project not found.");
  }

  // If taskId provided, check task exists and belongs to project
  if (validated.taskId) {
    const task = await prisma.task.findUnique({
      where: { id: validated.taskId },
      select: { projectId: true },
    });
    if (!task || task.projectId !== validated.projectId) {
      throw new Error("Task does not belong to the given project.");
    }
  }

  return validated;
}

export const createCost = async (data: any) => {
  const validated = await validateCostInput(data);

  const tags = data.tags
    ? await processTagsForCreate(data.tags)
    : { connect: [] };

  const newCost = await prisma.cost.create({
    data: {
      amount: validated.amount,
      type: validated.type,
      name: validated.name,
      description: validated.description,
      date: validated.date,
      projectId: validated.projectId,
      taskId: validated.taskId,
      tags,
    },
    include: { tags: true },
  });

  updateProjectCost(newCost.projectId);
  updateSearchIndex("cost", newCost);

  return newCost;
};

export const deleteCost = async (id: string) => {
  const deletedCost = await prisma.cost.delete({
    where: { id },
  });

  updateProjectCost(deletedCost.projectId);
  deleteSearchIndex("cost", id);

  return deletedCost;
};

export const updateCost = async (id: string, data: any) => {
  const validated = await validateCostInput(data);

  const tags = data.tags ? await processTagsForUpdate(data.tags) : { set: [] };

  const updatedCost = await prisma.cost.update({
    where: { id },
    data: {
      amount: validated.amount,
      type: validated.type,
      name: validated.name,
      description: validated.description,
      date: validated.date,
      projectId: validated.projectId,
      taskId: validated.taskId,
      tags,
    },
  });

  updateProjectCost(updatedCost.projectId);
  updateSearchIndex("cost", updatedCost);

  return updatedCost;
};

export const getCost = async (id: string) => {
  return await prisma.cost.findUnique({
    where: { id },
    include: {
      project: true,
      task: true,
      tags: true,
    },
  });
};

export async function getCosts(params: {
  search: string;
  pagination: { take: number; skip: number };
  ordering: { [key: string]: "asc" | "desc" };
}) {
  const where = {
    ...(params.search && { name: { contains: params.search } }),
  };

  const [costs, totalCount] = await Promise.all([
    prisma.cost.findMany({
      include: {
        project: true,
        task: true,
      },
      where,
      orderBy: params.ordering,
      take: params.pagination.take,
      skip: params.pagination.skip,
    }),
    prisma.task.count({ where }),
  ]);

  return { costs, totalCount };
}
