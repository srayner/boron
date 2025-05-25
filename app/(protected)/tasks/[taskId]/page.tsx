"use client";

import React, { use, useEffect, useState } from "react";
import { NextPage } from "next";
import { Task } from "@/types/entities";
import { Separator } from "@/components/ui/separator";
import { ClipboardList, Flag } from "lucide-react";
import { TaskStatusBadge } from "@/components/tasks/TaskStatusBadge";
import { TagsList } from "@/components/tags/TagsList";
import { format, formatDistanceToNow } from "date-fns";

type taskPageProps = {
  params: Promise<{ taskId: string }>;
};

const taskDetailPage: NextPage<taskPageProps> = ({ params }) => {
  const { taskId } = use(params);
  const [task, setTask] = useState<Task | null>(null);
  const descriptionFallback = "Every task is a step toward your goal.";

  const fetchTask = async () => {
    const response = await fetch(`/api/tasks/${taskId}`);
    const { task } = await response.json();
    setTask(task);
  };

  useEffect(() => {
    fetchTask();
  }, []);

  if (!task) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between">
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
      </div>

      <Separator className="my-3" />

      {/* Description and tags */}
      <p className="my-3">{task.description || descriptionFallback}</p>
      <TagsList tags={task.tags} />
    </div>
  );
};

export default taskDetailPage;
