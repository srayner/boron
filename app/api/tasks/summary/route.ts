import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { getTaskSummary } from "@/services/tasks";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const url = new URL(req.url);
  const localDate = url.searchParams.get("localDate");
  const data = await getTaskSummary(localDate);
  return data;
});
