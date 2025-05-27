"use client";

import React from "react";
import { useDashboardMilestones } from "@/hooks/useDashboardMilestones";
import { MilestoneDashboardWidget } from "@/components/milestones/MilestoneDashboardSummary";
import ProjectProgressGraph from "@/components/projects/ProjectProgressGraph";

export default function DashboardPage() {
  const { milestones, summary, loading, error } = useDashboardMilestones();

  if (loading) return <p>Loading milestones...</p>;
  if (error) return <p className="text-red-600">Failed to load: {error}</p>;

  return (
    <main className="p-6">
      <h1 className="text-2xl text-primary font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProjectProgressGraph />
        <MilestoneDashboardWidget milestones={milestones} summary={summary} />
      </div>
    </main>
  );
}
