import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import {
  getProjectById,
  deleteProjectById,
  updateProject,
} from "@/services/projects";
import { AppError } from "@/lib/api/error";
import { Context } from "@/types/api";

export const GET = withErrorHandling(
  async (req: NextRequest, context: Context) => {
    const { id: projectId } = await context.params;
    const project = await getProjectById(projectId);

    if (!project) {
      throw new AppError(`Project with id ${projectId} not found`, 404);
    }

    return { project };
  }
);

export const DELETE = withErrorHandling(
  async (req: NextRequest, context: Context) => {
    const { id: projectId } = await context.params;
    const deletedProject = await deleteProjectById(projectId);

    return { project: deletedProject };
  }
);

export const PUT = withErrorHandling(
  async (req: NextRequest, context: Context) => {
    const { id: projectId } = await context.params;
    const data = await req.json();

    const updatedProject = await updateProject(projectId, data);

    return { project: updatedProject };
  }
);
