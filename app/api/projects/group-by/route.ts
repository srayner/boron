import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { getProjectCountsBy } from "@/services/projects";
import { AppError } from "@/lib/api/error";
import { Prisma } from "@prisma/client";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const allowableFields = ["type", "status", "priority"];
  const field = req.nextUrl.searchParams.get("field") || "";

  if (!allowableFields.includes(field)) {
    throw new AppError("Invalid field.", 400);
  }

  const data = await getProjectCountsBy(field as Prisma.ProjectScalarFieldEnum);

  return data;
});
