"use client";

import React, { use, useEffect, useState } from "react";
import { NextPage } from "next";
import { Task } from "@/types/entities";

type taskPageProps = {
  params: Promise<{ taskId: string }>;
};

const taskDetailPage: NextPage<taskPageProps> = ({ params }) => {
  const { taskId } = use(params);
  const [task, setTask] = useState<Task | null>(null);

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
        <div>
          <h1 className="text-2xl font-semibold text-primary">{task.name}</h1>
        </div>
      </div>
    </div>
  );
};

export default taskDetailPage;
