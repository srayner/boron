import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { parseQueryParams } from "@/lib/api/query";
import { createCost, getCosts } from "@/services/costs";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const url = new URL(req.url);
  const { search, pagination, ordering } = parseQueryParams(url);
  const costs = await getCosts({ search, pagination, ordering });

  return { costs };
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const cost = await createCost(body);
  return { cost, status: 201 };
});
