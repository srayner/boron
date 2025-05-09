"use client";

import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ProjectTypeWithIcon } from "@/components/projects/project-type";
import { Project } from "@/types/entities";
import Link from "next/link";

export default function ProjectPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  const fetchProjects = async () => {
    try {
      const res = await fetch(
        "/api/projects?limit=10&orderBy=updatedAt&orderDir=desc"
      );
      if (!res.ok) throw new Error("Failed to fetch recent projects");
      const { projects } = await res.json();
      setProjects(projects);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div>
      <h2 className="text-3xl">All Projects</h2>
      {projects.map((project) => {
        return (
          <div
            key={project.id}
            className="flex flex-col gap-4 my-4 max-w-4xl mx-auto"
          >
            <Link
              href={`/projects/${project.id}`}
              className="text-2xl text-primary"
            >
              {project.name}
            </Link>
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
    </div>
  );
}
