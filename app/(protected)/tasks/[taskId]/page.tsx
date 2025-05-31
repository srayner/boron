"use client";

import React, { use, useEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/navigation";
import { Task } from "@/types/entities";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  CircleGauge,
  ClipboardList,
  Info,
  Pencil,
  PoundSterling,
  Trash2,
} from "lucide-react";
import { TaskStatusBadge } from "@/components/tasks/TaskStatusBadge";
import { TagsList } from "@/components/tags/TagsList";
import { Card, CardContent } from "@/components/ui/card";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { useRecentProjects } from "@/app/context/recent-projects-context";
import { DeletableType, DeleteInfo } from "@/types/ui";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Link } from "@/components/ui/link";
import { formatCurrency, titleCase, translate } from "@/lib/utils";
import CostsTable from "@/components/costs/CostsTable";

type taskPageProps = {
  params: Promise<{ taskId: string }>;
};

const TaskDetailPage: NextPage<taskPageProps> = ({ params }) => {
  const router = useRouter();
  const { taskId } = use(params);
  const [task, setTask] = useState<Task | null>(null);
  const descriptionFallback = "Every task is a step toward your goal.";
  const { refreshRecentProjects } = useRecentProjects();
  const [deleteInfo, setDeleteInfo] = useState<DeleteInfo | null>(null);
  const isConfirmOpen = !!deleteInfo;

  const fetchTask = async () => {
    const response = await fetch(`/api/tasks/${taskId}`);
    const { task } = await response.json();
    setTask(task);
  };

  useEffect(() => {
    fetchTask();
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

    if (deleteInfo.type === "task") {
      router.push(`/projects/${task!.projectId}?tab=tasks`);
    } else {
      fetchTask();
    }
  };

  if (!task) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        {/* Left side*/}
        <div className="flex items-center gap-4">
          <ClipboardList className="h-12 w-12 text-primary" />
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold text-primary">{task.name}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <TaskStatusBadge status={task.status} />
              <span>
                Updated{" "}
                {formatDistanceToNow(new Date(task.updatedAt), {
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
                `/projects/${task.project.id}/tasks/${taskId}/edit?returnTo=task`
              )
            }
            className="flex items-center"
          >
            <Pencil className="w-4 h-4 mr-1" /> Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteInfo({ type: "task", item: task })}
            className="flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </Button>
        </div>
      </div>

      <Separator className="my-3" />

      {/* Description and tags */}
      <p className="my-3">{task.description || descriptionFallback}</p>
      <TagsList tags={task.tags} />

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
                <Link href={`/projects/${task.project.id}`}>
                  {task.project.name}
                </Link>
              </dd>
              <dt className="font-medium text-muted-foreground">Status:</dt>
              <dd className="text-foreground">{translate(task.status)}</dd>
              <dt className="font-medium text-muted-foreground">Priority:</dt>
              <dd className="text-foreground">{translate(task.priority)}</dd>
            </dl>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent>
            <h3 className="text-muted-foreground mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Dates
            </h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-4">
              <dt className="font-medium text-muted-foreground">Start Date:</dt>
              <dd className="text-foreground">
                {task.startDate
                  ? format(new Date(task.startDate), "dd MMM yyyy")
                  : "No start date"}
              </dd>
              <dt className="font-medium text-muted-foreground">Due Date:</dt>
              <dd className="text-foreground">
                {task.dueDate
                  ? format(new Date(task.dueDate), "dd MMM yyyy")
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
              <dd className="text-forground">{task.progress}</dd>
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
        <h2 className="text-lg font-semibold">Costs</h2>
        <Button asChild size="sm">
          <Link href={`/projects/${task.project.id}/costs/add?returnTo=task`}>
            Create Cost
          </Link>
        </Button>
      </div>
      <CostsTable
        costs={task.costs}
        onDelete={setDeleteInfo}
        returnTo={"task"}
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

export default TaskDetailPage;
