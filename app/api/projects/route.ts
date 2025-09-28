import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { parseQueryParams } from "@/lib/api/query";
import { parseEnumParam } from "@/lib/api/params";
import { createProject, getProjects } from "@/services/projects";
import { projectTypes } from "@/types/entities";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const url = new URL(req.url);
  const { search, pagination, ordering } = parseQueryParams(url);
  const typeFilter = parseEnumParam(
    url.searchParams.get("typeFilter"),
    projectTypes
  );
  const data = await getProjects({ search, pagination, ordering, typeFilter });

  return data;
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const project = await createProject(body);
  return { project, status: 201 };
});
