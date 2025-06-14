"use client";

import { NextPage } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerField } from "@/components/ui/form/date-picker-field";
import { TagField } from "@/components/ui/form/TagField";
import { useRecentProjects } from "@/app/context/recent-projects-context";
import { Project } from "@/types/entities";
import { getReturnUrl } from "@/lib/navigation";

type ProjectEditPageProps = {
  params: Promise<{ projectId: string }>;
};

const ProjectEditPage: NextPage<ProjectEditPageProps> = ({ params }) => {
  const editProjectSchema = z.object({
    name: z.string().min(1, {
      message: "Title is required.",
    }),
    description: z.string().nullable(),
    type: z.string(),
    status: z.string(),
    priority: z.string(),
    startDate: z.coerce.date().nullable(),
    dueDate: z.coerce.date().nullable(),
    budget: z.string().nullable(),
    tags: z.string().nullable(),
  });

  type EditProjectSchema = z.infer<typeof editProjectSchema>;

  const { projectId } = React.use(params);

  const { refreshRecentProjects } = useRecentProjects();

  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? "";

  const form = useForm<EditProjectSchema>({
    resolver: zodResolver(editProjectSchema),
  });

  const onSubmit = async (values: FieldValues) => {
    const payload = {
      ...values,
      startDate: values.startDate ? values.startDate.toISOString() : null,
      dueDate: values.dueDate ? values.dueDate.toISOString() : null,
    };
    await fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    refreshRecentProjects();
    router.push(getReturnUrl(returnTo, { projectId }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectResponse] = await Promise.all([
          fetch(`/api/projects/${projectId}`),
        ]);

        if (!projectResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const { project } = (await projectResponse.json()) as {
          project: Project;
        };

        const formData = {
          name: project.name,
          description: project.description,
          type: project.type,
          status: project.status,
          priority: project.priority,
          startDate: project.startDate ? new Date(project.startDate) : null,
          dueDate: project.dueDate ? new Date(project.dueDate) : null,
          budget: project.budget?.toString() ?? null,
          tags: project.tags.map((t) => t.name).join(", "),
        };
        form.reset(formData);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [form, projectId]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-orange-700">Edit Project</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    className="h-32"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>
                  A brief description of what your project involves.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-[240px]">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AUTOMATION">Automation</SelectItem>
                      <SelectItem value="DESIGN">Design</SelectItem>
                      <SelectItem value="ELECTRONICS">Electronics</SelectItem>
                      <SelectItem value="GENERAL">General</SelectItem>
                      <SelectItem value="MAKER">Maker</SelectItem>
                      <SelectItem value="REPAIR">Repair</SelectItem>
                      <SelectItem value="WEBAPP">Web Application</SelectItem>
                      <SelectItem value="WEBSITE">Website</SelectItem>
                      <SelectItem value="WRITING">Writing</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-[240px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLANNED">Planned</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="ON_HOLD">On Hold</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-[240px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
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
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    className="w-[240px]"
                    type="text"
                    placeholder="£0.00"
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, ""); // Remove non-numeric characters
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => <TagField field={field} label="Tags" />}
          />

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
};

export default ProjectEditPage;
