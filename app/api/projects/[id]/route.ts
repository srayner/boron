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
    const projectId = context.params.id;
    const project = await getProjectById(projectId);

    if (!project) {
      throw new AppError(`Project with id ${projectId} not found`, 404);
    }

    return { project };
  }
);

export const DELETE = withErrorHandling(
  async (req: NextRequest, context: Context) => {
    const projectId = context.params.id;
    return await deleteProjectById(projectId);
  }
);

export const PUT = withErrorHandling(
  async (req: NextRequest, context: Context) => {
    const projectId = context.params.id;
    const data = await req.json();

    return await updateProject(projectId, data);
  }
);
