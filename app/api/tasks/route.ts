import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { withAuth } from "@/lib/api/with-auth";
import { parseQueryParams } from "@/lib/api/query";
import { parseEnumParam } from "@/lib/api/params";
import { createTask, getTasks } from "@/services/tasks";
import { parseLocalDate } from "@/lib/utils";

export const GET = withErrorHandling(
  withAuth(async (req: NextRequest) => {
    const url = new URL(req.url);
    const { search, pagination, ordering } = parseQueryParams(url);
    const statusFilter = parseEnumParam(url.searchParams.get("statusFilter"), [
      "open",
      "closed",
    ]);
    const dueDateFilter = parseEnumParam(
      url.searchParams.get("dueDateFilter"),
      ["with", "without"]
    );
    const overdue = url.searchParams.get("overdue") === "true";
    const localDate = url.searchParams.get("localDate");
    const dueDate = overdue
      ? { lt: parseLocalDate(localDate) ?? new Date() }
      : undefined;

    return await getTasks({
      search,
      pagination,
      ordering,
      statusFilter: overdue ? "open" : statusFilter,
      dueDate,
      dueDateFilter: overdue ? undefined : dueDateFilter,
    });
  })
);

export const POST = withErrorHandling(
  withAuth(async (req: NextRequest) => {
    const body = await req.json();
    const project = await createTask(body);
    return { project, status: 201 };
  })
);
