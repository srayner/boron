import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { getProjectProgress } from "@/services/projects";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const data = await getProjectProgress();

  return { data };
});
