import { withErrorHandling } from "@/lib/api/handler";
import { getTaskSummary } from "@/services/tasks";

export const GET = withErrorHandling(async () => {
  const data = await getTaskSummary();
  return data;
});
