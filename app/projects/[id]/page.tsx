"use client";

import { NextPage } from "next";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon,
  DollarSignIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { Project } from "@/types/entities";
import {
  ProjectNameWithIcon,
  ProjectTypeBadge,
} from "@/components/projects/project-type";
import { ProjectStatusBadge } from "@/components/projects/project-status";
import { format, formatDistanceToNow } from "date-fns";

type ProjectPageProps = {
  params: Promise<{ id: string }>;
};

const ProjectDetailPage: NextPage<ProjectPageProps> = ({ params }) => {
  const router = useRouter();
  const { id: projectId } = React.use(params);
  const [project, setProject] = useState<Project | null>(null);

  const fetchProject = async () => {
    const response = await fetch(`/api/projects/${projectId}`);
    const { project } = await response.json();
    setProject(project);
  };

  useEffect(() => {
    fetchProject();
  }, []);

  if (!project) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-orange-700">
            <ProjectNameWithIcon name={project.name} type={project.type} />
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <ProjectStatusBadge status={project.status} />
            <span text-sm text-muted-foreground>
              Updated{" "}
              {formatDistanceToNow(new Date(project.updatedAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/projects/${projectId}/edit`)}
          >
            <PencilIcon className="w-4 h-4 mr-1" /> Edit
          </Button>
          <Button variant="destructive" size="sm">
            <Trash2Icon className="w-4 h-4 mr-1" /> Delete
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="py-4">
            <h3 className="text-sm text-muted-foreground mb-1">Description</h3>
            <p>{project.description}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <h3 className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" /> Dates
            </h3>
            <p>
              Start:{" "}
              {project.startAt && format(new Date(project.startAt), "MMM yyyy")}
              <br />
              End:{" "}
              {project.endAt && format(new Date(project.endAt), "MMM yyyy")}
              <br />
              Deadline:{" "}
              {project.deadline &&
                format(new Date(project.deadline), "MMM yyyy")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <h3 className="text-sm text-muted-foreground mb-1">Completion</h3>
            <p>{project.completion}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <h3 className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
              <DollarSignIcon className="w-4 h-4" /> Actual Cost
            </h3>
            <p>£ 0.00</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for sub-sections */}
      <Tabs defaultValue="tasks" className="mt-8">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks">
          {/* Task list placeholder */}
          <div className="mt-4 text-sm text-muted-foreground">
            List of tasks goes here...
          </div>
        </TabsContent>
        <TabsContent value="milestones">
          <div className="mt-4 text-sm text-muted-foreground">
            Milestones go here...
          </div>
        </TabsContent>
        <TabsContent value="costs">
          <div className="mt-4 text-sm text-muted-foreground">
            Cost breakdown goes here...
          </div>
        </TabsContent>
        <TabsContent value="relationships">
          <div className="mt-4 text-sm text-muted-foreground">
            Task relationships go here...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetailPage;
