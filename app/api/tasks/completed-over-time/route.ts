import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { getCreatedAndCompletedTasksOverTime } from "@/services/tasks";
import { z } from "zod";

const querySchema = z.object({
  groupBy: z.enum(["day", "month"]).optional().default("day"),
  start: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date format, expected YYYY-MM-DD",
  }),
  end: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end date format, expected YYYY-MM-DD",
  }),
  timezone: z.string().optional().default("UTC"),
});

export const GET = withErrorHandling(async (req: NextRequest) => {
  const url = new URL(req.url);
  const queryParams = {
    groupBy: url.searchParams.get("groupBy") ?? undefined,
    start: url.searchParams.get("start") ?? "",
    end: url.searchParams.get("end") ?? "",
    timezone: url.searchParams.get("timezone") ?? undefined,
  };

  const parsed = querySchema.parse(queryParams);

  const startDate = new Date(parsed.start);
  const endDate = new Date(parsed.end);

  if (startDate > endDate) {
    throw new Error("Start date must be before or equal to end date.");
  }

  const data = await getCreatedAndCompletedTasksOverTime(
    parsed.groupBy,
    startDate,
    endDate,
    parsed.timezone
  );

  return { data };
});
