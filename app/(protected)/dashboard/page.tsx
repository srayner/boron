"use client";

import React from "react";
import { useDashboardMilestones } from "@/hooks/useDashboardMilestones";
import { useDashboardTasks } from "@/hooks/useDashboardTasks";
import { MilestoneDashboardWidget } from "@/components/milestones/MilestoneDashboardSummary";
import { TaskDashboardWidget } from "@/components/tasks/TaskDashboardSummary";
import ProjectProgressGraph from "@/components/projects/ProjectProgressGraph";
import ProjectGroupByBarGraph from "@/components/projects/ProjectGroupByBarGraph";
import TasksCompletedOverTime from "@/components/tasks/TasksCompletedOverTime";
import ProjectGroupByPieChart from "@/components/projects/ProjectByGroupPieChart";
import { getDateRange } from "@/lib/utils";

export default function DashboardPage() {
  const { milestones, summary: milestoneSummary, loading: milestonesLoading, error: milestonesError } = useDashboardMilestones();
  const { tasks, summary: taskSummary, loading: tasksLoading, error: tasksError } = useDashboardTasks();
  const { startDate, endDate } = getDateRange("day", 14);

  if (milestonesLoading || tasksLoading) return <p>Loading dashboard...</p>;
  if (milestonesError) return <p className="text-red-600">Failed to load milestones: {milestonesError}</p>;
  if (tasksError) return <p className="text-red-600">Failed to load tasks: {tasksError}</p>;

  return (
    <main className="p-4">
      <h1 className="text-2xl text-primary font-semibold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProjectProgressGraph />
        <ProjectGroupByPieChart field="type" title="Project By Type" />
        <ProjectGroupByBarGraph field="status" title="Project By Status" />

        <TasksCompletedOverTime
          groupBy={"day"}
          startDate={startDate}
          endDate={endDate}
        />
        <MilestoneDashboardWidget milestones={milestones} summary={milestoneSummary} />
        <TaskDashboardWidget tasks={tasks} summary={taskSummary} />
      </div>
    </main>
  );
}
