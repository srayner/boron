import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { parseQueryParams } from "@/lib/api/query";
import { getDueItems } from "@/services/due-items";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const { search, pagination, ordering } = parseQueryParams(req);
  const data = await getDueItems({ search, pagination, ordering });

  return data;
});
