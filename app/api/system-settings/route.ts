import { withErrorHandling } from "@/lib/api/handler";
import { getAllSystemSettings } from "@/services/system-settings";

export const GET = withErrorHandling(async () => {
  return await getAllSystemSettings();
});
