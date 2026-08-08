import { withErrorHandling } from "@/lib/api/handler";
import { withAuth } from "@/lib/api/with-auth";
import { getAllSystemSettings } from "@/services/system-settings";

export const GET = withErrorHandling(
  withAuth(async () => {
    return await getAllSystemSettings();
  })
);
