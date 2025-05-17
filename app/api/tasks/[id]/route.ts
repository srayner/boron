import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { getTask, deleteTask, updateTask } from "@/services/tasks";
import { AppError } from "@/lib/api/error";

export const GET = withErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id: taskId } = await params;
    const task = await getTask(taskId);

    if (!task) {
      throw new AppError(`Task with id ${taskId} not found`, 404);
    }

    return { task };
  }
);

export const DELETE = withErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id: taskId } = await params;
    const deletedTask = await deleteTask(taskId);

    return { task: deletedTask };
  }
);

export const PUT = withErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id: taskId } = await params;
    const data = await req.json();

    const updatedTask = await updateTask(taskId, data);

    return { task: updatedTask };
  }
);
