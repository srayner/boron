import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { getAllSystemSettings } from "@/services/system-settings";

export const GET = withErrorHandling(async (req: NextRequest) => {
  return await getAllSystemSettings();
});
