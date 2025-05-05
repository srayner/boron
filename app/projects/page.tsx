"use client";

import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

export default function ProjectPage() {
  const [projects, setProjects] = useState([]);

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
      <h2>All Projects</h2>
      {projects.map((project) => {
        return (
          <div>
            <h3>{project.name}</h3>
            <div>project.description</div>
            <span>
              {formatDistanceToNow(new Date(project.updatedAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
