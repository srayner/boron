import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { parseQueryParams } from "@/lib/api/query";
import { createTask, getTasks } from "@/services/tasks";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const { search, pagination, ordering } = parseQueryParams(req);
  const tasks = await getTasks({ search, pagination, ordering });

  return { tasks };
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const project = await createTask(body);
  return { project, status: 201 };
});
