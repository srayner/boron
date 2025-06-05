import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { parseQueryParams } from "@/lib/api/query";
import { createMilestone, getMilestones } from "@/services/milestones";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const url = new URL(req.url);
  const { search, pagination, ordering } = parseQueryParams(url);
  const projectId = req.nextUrl.searchParams.get("projectId") ?? undefined;
  const milestones = await getMilestones({
    search,
    pagination,
    ordering,
    projectId,
  });

  return { milestones };
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const milestone = await createMilestone(body);
  return { milestone, status: 201 };
});
