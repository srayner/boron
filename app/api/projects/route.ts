import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { parseQueryParams } from "@/lib/api/query";
import { createProject, getProjects } from "@/services/projects";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const url = new URL(req.url);
  const { search, pagination, ordering } = parseQueryParams(url);
  const data = await getProjects({ search, pagination, ordering });

  return data;
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const project = await createProject(body);
  return { project, status: 201 };
});
