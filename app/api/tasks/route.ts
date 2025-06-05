import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { parseQueryParams } from "@/lib/api/query";
import { createTask, getTasks } from "@/services/tasks";
import { parseEnumParam } from "@/lib/api/params";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const url = new URL(req.url);
  const { search, pagination, ordering } = parseQueryParams(url);
  const dueDateFilter = parseEnumParam(url.searchParams.get("dueDateFilter"), [
    "with",
    "without",
  ]);

  return await getTasks({ search, pagination, ordering, dueDateFilter });
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const project = await createTask(body);
  return { project, status: 201 };
});
