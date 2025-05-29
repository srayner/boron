import { withErrorHandling } from "@/lib/api/handler";
import { getProjectProgress } from "@/services/projects";

export const GET = withErrorHandling(async () => {
  const data = await getProjectProgress();

  return { data };
});
