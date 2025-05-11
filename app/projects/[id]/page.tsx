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
  PoundSterlingIcon,
  PencilIcon,
  Trash2Icon,
  CircleGaugeIcon,
  InfoIcon,
} from "lucide-react";
import { Project } from "@/types/entities";
import { ProjectNameWithIcon } from "@/components/projects/project-type";
import { ProjectStatusBadge } from "@/components/projects/project-status";
import { format, formatDistanceToNow } from "date-fns";
import { formatCurrency, titleCase } from "@/lib/utils";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

type ProjectPageProps = {
  params: Promise<{ id: string }>;
};

const ProjectDetailPage: NextPage<ProjectPageProps> = ({ params }) => {
  const router = useRouter();
  const { id: projectId } = React.use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  const fetchProject = async () => {
    const response = await fetch(`/api/projects/${projectId}`);
    const { project } = await response.json();
    setProject(project);
  };

  useEffect(() => {
    fetchProject();
  }, []);

  const handleConfirmDelete = async () => {
    setIsConfirmOpen(false);
    await fetch(`/api/projects/${projectId}`, {
      method: "DELETE",
    });

    router.push("/projects");
  };

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
            <span className="text-sm text-muted-foreground">
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
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              setIsConfirmOpen(true);
            }}
          >
            <Trash2Icon className="w-4 h-4 mr-1" /> Delete
          </Button>
        </div>
      </div>

      <Separator className="my-3" />

      <p className="my-3">{project.description}</p>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="py-4">
            <h3 className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
              <InfoIcon className="w-4 h-4" /> Summary
            </h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="font-medium text-muted-foreground">Type:</dt>
              <dd className="text-foreground">{titleCase(project.type)}</dd>
              <dt className="font-medium text-muted-foreground">Priority:</dt>
              <dd className="text-foreground">{titleCase(project.priority)}</dd>
              <dt className="font-medium text-muted-foreground">Status:</dt>
              <dd className="text-foreground">{titleCase(project.status)}</dd>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <h3 className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" /> Dates
            </h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="font-medium text-muted-foreground">Start</dt>
              <dd className="text-forground">
                {project.startDate &&
                  format(new Date(project.startDate), "dd MMM yyyy")}
              </dd>

              <dt className="font-medium text-muted-foreground">End</dt>
              <dd className="text-forground">
                {project.dueDate &&
                  format(new Date(project.dueDate), "dd MMM yyyy")}
              </dd>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <h3 className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
              <CircleGaugeIcon className="w-4 h-4" /> Progress
            </h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="font-medium text-muted-foreground">
                Percent Complete:
              </dt>
              <dd className="text-forground">{project.completionPercent}</dd>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <h3 className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
              <PoundSterlingIcon className="w-4 h-4" /> Costs
            </h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="font-medium text-muted-foreground">Budget:</dt>
              <dd className="text-foreground">
                {formatCurrency(project.budget)}
              </dd>

              <dt className="font-medium text-muted-foreground">
                Actual Cost:
              </dt>
              <dd className="text-forground">
                {formatCurrency(project.actualCost)}
              </dd>
            </dl>
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

      <ConfirmationModal
        open={isConfirmOpen}
        title="Delete Project"
        message={`Are you sure you want to delete project: ${project.name}`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsConfirmOpen(false);
        }}
      />
    </div>
  );
};

export default ProjectDetailPage;
