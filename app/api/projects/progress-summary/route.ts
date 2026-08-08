import { withErrorHandling } from "@/lib/api/handler";
import { withAuth } from "@/lib/api/with-auth";
import { getProjectProgress } from "@/services/projects";

export const GET = withErrorHandling(
  withAuth(async () => {
    const data = await getProjectProgress();

    return { data };
  })
);
