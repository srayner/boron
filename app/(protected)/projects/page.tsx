"use client";

import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ProjectTypeWithIcon } from "@/components/projects/project-type";
import { Project } from "@/types/entities";
import Link from "next/link";
import ProjectListHeader from "@/components/projects/ProjectListHeader";
import PaginationControls from "@/components/ui/PaginationControls";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default function ProjectPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialPage = Number(searchParams.get("page") ?? "1");
  const [page, setPage] = useState<number>(initialPage);

  const initialSearch = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(initialSearch);

  const limit = 10;
  const skip = (page - 1) * limit;
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const fetchProjects = async () => {
    try {
      const res = await fetch(
        `/api/projects?limit=${limit}&skip=${skip}&orderBy=updatedAt&orderDir=desc&search=${search}`
      );
      if (!res.ok) throw new Error("Failed to fetch recent projects");
      const { projects, totalCount } = await res.json();
      setProjects(projects);
      setTotalCount(totalCount);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [page, search]);

  return (
    <div className="max-w-4xl mx-auto my-4">
      <ProjectListHeader
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          const params = new URLSearchParams(searchParams.toString());
          params.set("search", value);
          params.set("page", "1"); // reset to first page on search
          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
          setPage(1);
        }}
      />
      {projects.map((project) => {
        return (
          <div
            key={project.id}
            className="flex flex-col gap-4 my-4 max-w-4xl mx-auto"
          >
            <div>
              <Link
                href={`/projects/${project.id}`}
                className="text-2xl text-primary"
              >
                {project.name}
              </Link>
              <div className="w-32">
                {`${project.progress}%`}
                <ProgressBar percent={project.progress} height={8} />
              </div>
            </div>
            <div className="text-muted-foreground">{project.description}</div>
            <div className="flex gap-4 text-muted-foreground">
              <ProjectTypeWithIcon type={project.type} />

              <span>
                Updated{" "}
                {formatDistanceToNow(new Date(project.updatedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <hr className="mt-4" />
          </div>
        );
      })}
      <PaginationControls
        currentPage={page}
        pageSize={limit}
        totalCount={totalCount ?? 0}
        onPageChange={(newPage) => {
          setPage(newPage);
          const params = new URLSearchParams(searchParams.toString());
          params.set("page", newPage.toString());
          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }}
      />
    </div>
  );
}
