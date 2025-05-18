import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { parseQueryParams } from "@/lib/api/query";
import { createMilestone, getMilestones } from "@/services/milestones";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const { search, pagination, ordering } = parseQueryParams(req);
  const milestones = await getMilestones({ search, pagination, ordering });

  return { milestones };
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const milestone = await createMilestone(body);
  return { milestone, status: 201 };
});
