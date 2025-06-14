"use client";

import React from "react";
import { useDashboardMilestones } from "@/hooks/useDashboardMilestones";
import { MilestoneDashboardWidget } from "@/components/milestones/MilestoneDashboardSummary";
import ProjectProgressGraph from "@/components/projects/ProjectProgressGraph";
import ProjectGroupByGraph from "@/components/projects/ProjectGroupByGraph";
import TasksCompletedOverTime from "@/components/tasks/TasksCompletedOverTime";
import { getDateRange } from "@/lib/utils";

export default function DashboardPage() {
  const { milestones, summary, loading, error } = useDashboardMilestones();
  const { startDate, endDate } = getDateRange("day");

  if (loading) return <p>Loading milestones...</p>;
  if (error) return <p className="text-red-600">Failed to load: {error}</p>;

  return (
    <main className="p-6">
      <h1 className="text-2xl text-primary font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProjectProgressGraph />
        <ProjectGroupByGraph field="type" title="Project By Type" />
        <ProjectGroupByGraph field="status" title="Project By Status" />
        <TasksCompletedOverTime
          groupBy={"day"}
          title="Tasks Completed"
          startDate={startDate}
          endDate={endDate}
        />
        <MilestoneDashboardWidget milestones={milestones} summary={summary} />
      </div>
    </main>
  );
}
