import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/api/error";
import { z } from "zod";

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
  note: z.string().max(250).optional(),
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

  return prisma.cost.create({
    data: {
      amount: validated.amount,
      type: validated.type,
      note: validated.note,
      date: validated.date,
      projectId: validated.projectId,
      taskId: validated.taskId,
    },
  });
};

export const deleteCost = async (id: string) => {
  return await prisma.cost.delete({
    where: { id },
  });
};

export const updateCost = async (id: string, data: any) => {
  const validated = await validateCostInput(data);

  return prisma.cost.update({
    where: { id },
    data: {
      amount: validated.amount,
      type: validated.type,
      note: validated.note,
      date: validated.date,
      projectId: validated.projectId,
      taskId: validated.taskId,
    },
  });
};

export const getCost = async (id: string) => {
  return await prisma.cost.findUnique({
    where: { id },
    include: {
      project: true,
      task: true,
    },
  });
};

export async function getCosts(params: {
  search: string;
  pagination: { take: number; skip: number };
  ordering: { [key: string]: "asc" | "desc" };
}) {
  return prisma.cost.findMany({
    include: {
      project: true,
      task: true,
    },
    where: {
      note: {
        contains: params.search,
      },
    },
    orderBy: params.ordering,
    take: params.pagination.take,
    skip: params.pagination.skip,
  });
}
