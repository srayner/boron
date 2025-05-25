import { withErrorHandling } from "@/lib/api/handler";
import { getSummary } from "@/services/milestones";

export const GET = withErrorHandling(async () => {
  const data = await getSummary();
  return data;
});
