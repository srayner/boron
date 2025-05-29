"use client";

import { NextPage } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "@/components/ui/link";
import React, { useEffect, useState, use } from "react";
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
import { ProjectStatusBadge } from "@/components/projects/project-status";
import { format, formatDistanceToNow } from "date-fns";
import { formatCurrency, formatDate, titleCase, translate } from "@/lib/utils";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useRecentProjects } from "@/app/context/recent-projects-context";
import { ProjectTypeIcon } from "@/components/projects/ProjectTypeIcon";
import { TagsList } from "@/components/tags/TagsList";
import TasksTable from "@/components/tasks/TasksTable";
import { DeleteInfo, DeletableType } from "@/types/ui";

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
};

const ProjectDetailPage: NextPage<ProjectPageProps> = ({ params }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "tasks";

  const { refreshRecentProjects } = useRecentProjects();
  const [activeTab, setActiveTab] = React.useState(tab);
  const { projectId } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const descriptionFallback = "Every great project starts with a blank page.";

  const [deleteInfo, setDeleteInfo] = useState<DeleteInfo | null>(null);
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
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-end justify-between">
        {/* Left side*/}
        <div className="flex items-center gap-4">
          <ProjectTypeIcon
            type={project.type}
            className="h-12 w-12 text-primary"
          />
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold text-primary">
              {project.name}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <ProjectStatusBadge status={project.status} />
              <span>
                Updated{" "}
                {formatDistanceToNow(new Date(project.updatedAt), {
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
              router.push(`/projects/${projectId}/edit?returnTo=project`)
            }
            className="flex items-center"
          >
            <PencilIcon className="w-4 h-4 mr-1" /> Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteInfo({ type: "project", item: project })}
            className="flex items-center"
          >
            <Trash2Icon className="w-4 h-4 mr-1" /> Delete
          </Button>
        </div>
      </div>

      <Separator className="my-3" />

      {/* Description and tags */}
      <p className="my-3">{project.description || descriptionFallback}</p>
      <TagsList tags={project.tags} />

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="py-4">
          <CardContent>
            <h3 className="text-muted-foreground flex items-center gap-2">
              <InfoIcon className="w-4 h-4" /> Summary
            </h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-4">
              <dt className="font-medium text-muted-foreground">Type:</dt>
              <dd className="text-foreground">{titleCase(project.type)}</dd>
              <dt className="font-medium text-muted-foreground">Priority:</dt>
              <dd className="text-foreground">{titleCase(project.priority)}</dd>
              <dt className="font-medium text-muted-foreground">Status:</dt>
              <dd className="text-foreground">{titleCase(project.status)}</dd>
            </dl>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent>
            <h3 className="text-muted-foreground mb-1 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" /> Dates
            </h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-4">
              <dt className="font-medium text-muted-foreground">
                {project.startDate ? "Start:" : "Created:"}
              </dt>
              <dd className="text-foreground">
                {project.startDate
                  ? formatDate(project.startDate)
                  : formatDate(project.createdAt)}
              </dd>

              <dt className="font-medium text-muted-foreground">Due Date:</dt>
              <dd className="text-foreground">
                {project.dueDate
                  ? format(new Date(project.dueDate), "dd MMM yyyy")
                  : "No due date"}
              </dd>
            </dl>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent>
            <h3 className="text-muted-foreground mb-1 flex items-center gap-2">
              <CircleGaugeIcon className="w-4 h-4" /> Progress
            </h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-4">
              <dt className="font-medium text-muted-foreground">Progress:</dt>
              <dd className="text-forground">{project.progress}</dd>
            </dl>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent>
            <h3 className="text-muted-foreground mb-1 flex items-center gap-2">
              <PoundSterlingIcon className="w-4 h-4" /> Costs
            </h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-4">
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
            <TasksTable
              tasks={project.tasks}
              onDelete={setDeleteInfo}
              returnTo="project:tasks"
            />
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
                    <td className="p-2">
                      <Link href={`/milestones/${milestone.id}`}>
                        {milestone.name}
                      </Link>
                    </td>
                    <td className="p-2">{translate(milestone.status)}</td>
                    <td className="p-2">{milestone.order}</td>
                    <td className="p-2">{formatDate(milestone.dueDate)}</td>
                    <td className="p-2 flex gap-2">
                      <Link
                        href={`/projects/${projectId}/milestones/${milestone.id}/edit?returnTo=project:milestones`}
                        className="text-forground"
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
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Amount</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Note</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {project.costs.map((cost) => (
                  <tr key={cost.id} className="border-t">
                    <td className="p-2">{formatDate(cost.date)}</td>
                    <td className="p-2">
                      <Link className="text-primary" href={`/costs/${cost.id}`}>
                        {formatCurrency(cost.amount)}
                      </Link>
                    </td>
                    <td className="p-2">{translate(cost.type)}</td>
                    <td className="p-2">{cost.note}</td>
                    <td className="p-2 flex gap-2">
                      <Link
                        href={`/projects/${projectId}/costs/${cost.id}/edit?returnTo=project:costs`}
                        className="text-forground"
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
