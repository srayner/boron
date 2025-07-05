import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { parseQueryParams } from "@/lib/api/query";
import { parseEnumParam } from "@/lib/api/params";
import { createTask, getTasks } from "@/services/tasks";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const url = new URL(req.url);
  const { search, pagination, ordering } = parseQueryParams(url);
  const statusFilter = parseEnumParam(url.searchParams.get("statusFilter"), [
    "open",
    "closed",
  ]);
  const dueDateFilter = parseEnumParam(url.searchParams.get("dueDateFilter"), [
    "with",
    "without",
  ]);

  return await getTasks({
    search,
    pagination,
    ordering,
    statusFilter,
    dueDateFilter,
  });
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const project = await createTask(body);
  return { project, status: 201 };
});
