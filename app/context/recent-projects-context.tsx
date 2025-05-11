"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Project } from "@/types/entities";

interface RecentProjectsContextValue {
  recentProjects: Project[];
  refreshRecentProjects: () => Promise<void>;
}

const RecentProjectsContext = createContext<
  RecentProjectsContextValue | undefined
>(undefined);

export const RecentProjectsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);

  const refreshRecentProjects = async () => {
    try {
      const res = await fetch(
        "/api/projects?limit=6&orderBy=updatedAt&orderDir=desc"
      );
      if (!res.ok) throw new Error("Failed to fetch recent projects");
      const { projects } = await res.json();
      setRecentProjects(projects);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    refreshRecentProjects();
  }, []);

  return (
    <RecentProjectsContext.Provider
      value={{ recentProjects, refreshRecentProjects }}
    >
      {children}
    </RecentProjectsContext.Provider>
  );
};

export const useRecentProjects = () => {
  const context = useContext(RecentProjectsContext);
  if (!context)
    throw new Error(
      "useRecentProjects must be used within RecentProjectsProvider"
    );
  return context;
};
