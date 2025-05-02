import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { parseQueryParams } from "@/lib/api/query";
import { createProject, getProjects } from "@/services/projects";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const { search, pagination, ordering } = parseQueryParams(req);
  const projects = await getProjects({ search, pagination, ordering });

  return { projects };
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const project = await createProject(body);
  return { project, status: 201 };
});
