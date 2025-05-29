"use client";

import React, { use, useEffect, useState } from "react";
import { NextPage } from "next";
import { Milestone } from "@/types/entities";
import { Separator } from "@/components/ui/separator";
import { TagsList } from "@/components/tags/TagsList";
import { Flag } from "lucide-react";
import { MilestoneStatusBadge } from "@/components/milestones/MilestoneStatusBadge";
import { formatDistanceToNow } from "date-fns";
import TasksTable from "@/components/tasks/TasksTable";

type MilestonePageProps = {
  params: Promise<{ milestoneId: string }>;
};

const MilestoneDetailPage: NextPage<MilestonePageProps> = ({ params }) => {
  const { milestoneId } = use(params);
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const descriptionFallback = "Every milestone begins with a single step.";

  const fetchMilestone = async () => {
    const response = await fetch(`/api/milestones/${milestoneId}`);
    const { milestone } = await response.json();
    setMilestone(milestone);
  };

  useEffect(() => {
    fetchMilestone();
  }, []);

  if (!milestone) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        {/* Left side*/}
        <div className="flex items-center gap-4">
          <Flag className="h-12 w-12 text-primary" />
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold text-primary">
              {milestone.name}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <MilestoneStatusBadge status={milestone.status} />
              <span>
                Updated{" "}
                {formatDistanceToNow(new Date(milestone.updatedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-3" />

      {/* Description and tags */}
      <p className="my-3">{milestone.description || descriptionFallback}</p>
      <TagsList tags={milestone.tags} />

      <h3 className="mt-4 mb-2">Tasks</h3>
      <TasksTable
        tasks={milestone.tasks}
        onDelete={({ type: string, item: unknown }) => {}}
      />
    </div>
  );
};

export default MilestoneDetailPage;
