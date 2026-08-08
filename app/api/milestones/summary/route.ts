import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { withAuth } from "@/lib/api/with-auth";
import { getSummary } from "@/services/milestones";

export const GET = withErrorHandling(
  withAuth(async (req: NextRequest) => {
    const url = new URL(req.url);
    const localDate = url.searchParams.get("localDate");
    const data = await getSummary(localDate);
    return data;
  })
);
