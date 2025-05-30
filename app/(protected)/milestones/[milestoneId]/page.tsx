"use client";

import React, { use, useEffect, useState } from "react";
import { NextPage } from "next";
import { Milestone } from "@/types/entities";
import { Separator } from "@/components/ui/separator";
import { TagsList } from "@/components/tags/TagsList";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  CircleGauge,
  Flag,
  Info,
  Pencil,
  PoundSterling,
  Trash2,
} from "lucide-react";
import { MilestoneStatusBadge } from "@/components/milestones/MilestoneStatusBadge";
import { format, formatDistanceToNow } from "date-fns";
import TasksTable from "@/components/tasks/TasksTable";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { DeleteInfo, DeletableType } from "@/types/ui";
import { useRecentProjects } from "@/app/context/recent-projects-context";
import { formatCurrency, titleCase } from "@/lib/utils";
import { Link } from "@/components/ui/link";

type MilestonePageProps = {
  params: Promise<{ milestoneId: string }>;
};

const MilestoneDetailPage: NextPage<MilestonePageProps> = ({ params }) => {
  const router = useRouter();
  const { milestoneId } = use(params);
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const descriptionFallback = "Every milestone begins with a single step.";
  const { refreshRecentProjects } = useRecentProjects();
  const [deleteInfo, setDeleteInfo] = useState<DeleteInfo | null>(null);
  const isConfirmOpen = !!deleteInfo;

  const fetchMilestone = async () => {
    const response = await fetch(`/api/milestones/${milestoneId}`);
    const { milestone } = await response.json();
    setMilestone(milestone);
  };

  useEffect(() => {
    fetchMilestone();
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteInfo) return;

    const apiMap: Record<DeletableType, string> = {
      project: "projects",
      task: "tasks",
      milestone: "milestones",
      cost: "costs",
    };

    const endpoint = apiMap[deleteInfo.type];
    const url = `/api/${endpoint}/${deleteInfo.item.id}`;

    await fetch(url, { method: "DELETE" });

    setDeleteInfo(null);
    refreshRecentProjects();

    if (deleteInfo.type === "milestone") {
      router.push(`/projects/${milestone!.project.id}?tab=milestones`);
    } else {
      fetchMilestone();
    }
  };

  if (!milestone) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-end justify-between">
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

        {/* Right side: buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(
                `/projects/${milestone.project.id}/milestones/${milestoneId}/edit?returnTo=milestone`
              )
            }
            className="flex items-center"
          >
            <Pencil className="w-4 h-4 mr-1" /> Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() =>
              setDeleteInfo({ type: "milestone", item: milestone })
            }
            className="flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </Button>
        </div>
      </div>

      <Separator className="my-3" />

      {/* Description and tags */}
      <p className="my-3">{milestone.description || descriptionFallback}</p>
      <TagsList tags={milestone.tags} />

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card className="py-4">
          <CardContent>
            <h3 className="text-muted-foreground flex items-center gap-2">
              <Info className="w-4 h-4" /> Summary
            </h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-4">
              <dt className="font-medium text-muted-foreground">Project:</dt>
              <dd className="text-foreground">
                <Link href={`/projects/${milestone.project.id}`}>
                  {titleCase(milestone.project.name)}
                </Link>
              </dd>
              <dt className="font-medium text-muted-foreground">Status:</dt>
              <dd className="text-foreground">{titleCase(milestone.status)}</dd>
            </dl>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent>
            <h3 className="text-muted-foreground mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Dates
            </h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-4">
              <dt className="font-medium text-muted-foreground">Due Date:</dt>
              <dd className="text-foreground">
                {milestone.dueDate
                  ? format(new Date(milestone.dueDate), "dd MMM yyyy")
                  : "No due date"}
              </dd>
            </dl>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent>
            <h3 className="text-muted-foreground mb-1 flex items-center gap-2">
              <CircleGauge className="w-4 h-4" /> Progress
            </h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-4">
              <dt className="font-medium text-muted-foreground">Progress:</dt>
              <dd className="text-forground">{milestone.progress}</dd>
            </dl>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent>
            <h3 className="text-muted-foreground mb-1 flex items-center gap-2">
              <PoundSterling className="w-4 h-4" /> Costs
            </h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-4">
              <dt className="font-medium text-muted-foreground">
                Actual Cost:
              </dt>
              <dd className="text-forground">{formatCurrency(0)}</dd>
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <Button asChild size="sm">
          <Link href={`/projects/${milestone.project.id}/tasks/add`}>
            Create Task
          </Link>
        </Button>
      </div>
      <TasksTable
        tasks={milestone.tasks}
        onDelete={setDeleteInfo}
        returnTo={"milestone"}
      />

      <ConfirmationModal
        open={isConfirmOpen}
        title={`Delete ${deleteInfo?.type ?? ""}`}
        message={`Are you sure you want to delete ${deleteInfo?.type}: ${deleteInfo?.item.name}?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteInfo(null)}
      />
    </div>
  );
};

export default MilestoneDetailPage;
