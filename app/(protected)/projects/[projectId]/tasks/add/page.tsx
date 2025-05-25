"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRecentProjects } from "@/app/context/recent-projects-context";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { DatePickerField } from "@/components/ui/form/date-picker-field";
import { SelectField } from "@/components/ui/form/SelectField";
import { TextAreaField } from "@/components/ui/form/TextAreaField";
import { TextField } from "@/components/ui/form/TextField";
import { NextPage } from "next";
import { Milestone } from "@/types/entities";

type TaskAddPageProps = {
  params: Promise<{ projectId: string }>;
};

const TaskAddPage: NextPage<TaskAddPageProps> = ({ params }) => {
  const router = useRouter();
  const { refreshRecentProjects } = useRecentProjects();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { projectId } = React.use(params);

  const formSchema = z.object({
    name: z.string().min(1, {
      message: "Name is required.",
    }),
    description: z.string().nullable(),
    status: z.string(),
    priority: z.string(),
    milestoneId: z.string().nullable(),
    startDate: z.coerce.date().nullable(),
    dueDate: z.coerce.date().nullable(),
    tags: z.string().nullable(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: null,
      status: "PLANNED",
      priority: "MEDIUM",
      milestoneId: null,
      startDate: null,
      dueDate: null,
      tags: null,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [milestonesResponse] = await Promise.all([
          fetch(`/api/milestones?projectId=${projectId}`),
        ]);

        if (!milestonesResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const { milestones } = await milestonesResponse.json();
        setMilestones(milestones);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      projectId,
      ...values,
      startDate: values.startDate ? values.startDate.toISOString() : null,
      dueDate: values.dueDate ? values.dueDate.toISOString() : null,
    };
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      refreshRecentProjects();
      router.push(`/projects/${projectId}?tab=tasks`);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  }

  const statusOptions = [
    { id: "PLANNED", name: "Planned" },
    { id: "IN_PROGRESS", name: "In Progress" },
    { id: "ON_HOLD", name: "On Hold" },
    { id: "BLOCKED", name: "Blocked" },
    { id: "COMPLETED", name: "Completed" },
    { id: "CANCELLED", name: "Cancelled" },
  ];

  const priorityOptions = [
    { id: "LOW", name: "Low" },
    { id: "MEDIUM", name: "Medium" },
    { id: "HIGH", name: "High" },
    { id: "CRITICAL", name: "Critical" },
  ];

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-orange-700">Create Task</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <TextField
                field={field}
                label="Name"
                placeholder="Enter your name"
              />
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <TextAreaField
                field={field}
                label="Description"
                description="A brief description of what your task involves."
                className="h-32"
              />
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <SelectField field={field} label="Status" items={statusOptions} />
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <SelectField
                field={field}
                label="Priority"
                items={priorityOptions}
              />
            )}
          />

          <FormField
            control={form.control}
            name="milestoneId"
            render={({ field }) => (
              <SelectField field={field} label="Milestone" items={milestones} />
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <DatePickerField field={field} label="Start Date" />
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <DatePickerField field={field} label="Due Date" />
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => <TextField field={field} label="Tags" />}
          />

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
};

export default TaskAddPage;
