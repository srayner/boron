"use client";

import { NextPage } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
  Pencil,
  Trash2,
} from "lucide-react";
import { Project } from "@/types/entities";
import { ProjectNameWithIcon } from "@/components/projects/project-type";
import { ProjectStatusBadge } from "@/components/projects/project-status";
import { format, formatDistanceToNow } from "date-fns";
import { formatCurrency, formatDate, titleCase, translate } from "@/lib/utils";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useRecentProjects } from "@/app/context/recent-projects-context";

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
};

type DeletableType = "project" | "task" | "milestone" | "cost";
interface DeletableItem {
  id: string;
  name: string;
}

const ProjectDetailPage: NextPage<ProjectPageProps> = ({ params }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "costs";

  const { refreshRecentProjects } = useRecentProjects();
  const [activeTab, setActiveTab] = React.useState(tab);
  const { projectId } = React.use(params);
  const [project, setProject] = useState<Project | null>(null);

  const [deleteInfo, setDeleteInfo] = useState<{
    type: DeletableType;
    item: DeletableItem;
  } | null>(null);
  const isConfirmOpen = !!deleteInfo;

  const fetchProject = async () => {
    const response = await fetch(`/api/projects/${projectId}`);
    const { project } = await response.json();
    setProject(project);
  };

  useEffect(() => {
    fetchProject();
  }, []);

  React.useEffect(() => {
    if (tab !== activeTab) setActiveTab(tab);
  }, [tab]);

  const onTabChange = (newTab: string) => {
    setActiveTab(newTab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", newTab);
    router.replace(url.toString());
  };

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

    if (deleteInfo.type === "project") {
      router.push("/projects");
    } else {
      fetchProject();
    }
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
              setDeleteInfo({ type: "project", item: project });
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
      <Tabs value={activeTab} onValueChange={onTabChange} className="mt-8">
        <TabsList className="justify-start gap-2">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks">
          <div className="mt-4 text-sm text-muted-foreground">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Tasks</h2>
              <Button asChild size="sm">
                <Link href={`/projects/${projectId}/tasks/add`}>
                  Create Task
                </Link>
              </Button>
            </div>
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-muted text-muted-foreground">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Priority</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Start Date</th>
                  <th className="text-left p-2">Due Date</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {project.tasks.map((task) => (
                  <tr key={task.id} className="border-t">
                    <td className="p-2">{task.name}</td>
                    <td className="p-2">{translate(task.priority)}</td>
                    <td className="p-2">{translate(task.status)}</td>
                    <td className="p-2">{formatDate(task.startDate)}</td>
                    <td className="p-2">{formatDate(task.dueDate)}</td>
                    <td className="p-2 flex gap-2">
                      <Link
                        href={`/projects/${projectId}/tasks/${task.id}/edit`}
                      >
                        <Pencil className="w-4 h-4 hover:text-primary" />
                      </Link>
                      <button
                        onClick={() => {
                          setDeleteInfo({ type: "task", item: task });
                        }}
                      >
                        <Trash2 className="w-4 h-4 hover:text-destructive" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="milestones">
          <div className="mt-4 text-sm text-muted-foreground">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Milestones</h2>
              <Button asChild size="sm">
                <Link href={`/projects/${projectId}/milestones/add`}>
                  Create Milestone
                </Link>
              </Button>
            </div>
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-muted text-muted-foreground">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Order</th>
                  <th className="text-left p-2">Due Date</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {project.milestones.map((milestone) => (
                  <tr key={milestone.id} className="border-t">
                    <td className="p-2">{milestone.name}</td>
                    <td className="p-2">{translate(milestone.status)}</td>
                    <td className="p-2">{milestone.order}</td>
                    <td className="p-2">{formatDate(milestone.dueDate)}</td>
                    <td className="p-2 flex gap-2">
                      <Link
                        href={`/projects/${projectId}/milestones/${milestone.id}/edit`}
                      >
                        <Pencil className="w-4 h-4 hover:text-primary" />
                      </Link>
                      <button
                        onClick={() => {
                          setDeleteInfo({ type: "milestone", item: milestone });
                        }}
                      >
                        <Trash2 className="w-4 h-4 hover:text-destructive" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="costs">
          <div className="mt-4 text-sm text-muted-foreground">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Costs</h2>
              <Button asChild size="sm">
                <Link href={`/projects/${projectId}/costs/add`}>
                  Create Cost
                </Link>
              </Button>
            </div>
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-muted text-muted-foreground">
                  <th className="text-left p-2">Amount</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Note</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {project.costs.map((cost) => (
                  <tr key={cost.id} className="border-t">
                    <td className="p-2">{cost.amount}</td>
                    <td className="p-2">{translate(cost.type)}</td>
                    <td className="p-2">{formatDate(cost.date)}</td>
                    <td className="p-2">{cost.note}</td>
                    <td className="p-2 flex gap-2">
                      <Link
                        href={`/projects/${projectId}/costs/${cost.id}/edit`}
                      >
                        <Pencil className="w-4 h-4 hover:text-primary" />
                      </Link>
                      <button
                        onClick={() => {
                          setDeleteInfo({
                            type: "cost",
                            item: {
                              ...cost,
                              name: `${cost.type} - $${cost.amount}`,
                            },
                          });
                        }}
                      >
                        <Trash2 className="w-4 h-4 hover:text-destructive" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        title={`Delete ${deleteInfo?.type ?? ""}`}
        message={`Are you sure you want to delete ${deleteInfo?.type}: ${deleteInfo?.item.name}?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteInfo(null)}
      />
    </div>
  );
};

export default ProjectDetailPage;
