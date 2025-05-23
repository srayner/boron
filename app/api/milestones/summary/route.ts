import { withErrorHandling } from "@/lib/api/handler";
import { getSummary } from "@/services/milestones";
import { NextResponse } from "next/server";

export const GET = withErrorHandling(async () => {
  const data = await getSummary();
  return data;
});
