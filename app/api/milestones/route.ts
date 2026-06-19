import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { parseQueryParams } from "@/lib/api/query";
import { parseEnumParam } from "@/lib/api/params";
import { createMilestone, getMilestones } from "@/services/milestones";
import { parseLocalDate } from "@/lib/utils";

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
  const projectId = req.nextUrl.searchParams.get("projectId") ?? undefined;
  const overdue = url.searchParams.get("overdue") === "true";
  const localDate = url.searchParams.get("localDate");
  const dueDate = overdue
    ? { lt: parseLocalDate(localDate) ?? new Date() }
    : undefined;
  return await getMilestones({
    search,
    pagination,
    ordering,
    projectId,
    statusFilter: overdue ? "open" : statusFilter,
    dueDate,
    dueDateFilter: overdue ? undefined : dueDateFilter,
  });
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const milestone = await createMilestone(body);
  return { milestone, status: 201 };
});
