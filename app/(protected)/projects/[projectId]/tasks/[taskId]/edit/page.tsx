"use client";

import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRecentProjects } from "@/app/context/recent-projects-context";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import Link from "next/link";

type TaskEditPageProps = {
  params: Promise<{ projectId: string; taskId: string }>;
};

const TaskEditPage: NextPage<TaskEditPageProps> = ({ params }) => {
  const router = useRouter();
  const { refreshRecentProjects } = useRecentProjects();
  const { projectId, taskId } = React.use(params);
  const [isLoading, setIsLoading] = useState(true);

  const formSchema = z.object({
    name: z.string().min(1, {
      message: "Name is required.",
    }),
    description: z.string().nullable(),
    status: z.string(),
    priority: z.string(),
    startDate: z.coerce.date().nullable(),
    dueDate: z.coerce.date().nullable(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: null,
      status: "PLANNED",
      priority: "MEDIUM",
      startDate: null,
      dueDate: null,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      projectId,
      ...values,
      startDate: values.startDate ? values.startDate.toISOString() : null,
      dueDate: values.dueDate ? values.dueDate.toISOString() : null,
    };
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      refreshRecentProjects();
      router.push(`/projects/${projectId}?tab=tasks`);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskResponse] = await Promise.all([
          fetch(`/api/tasks/${taskId}`),
        ]);

        if (!taskResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const { task } = await taskResponse.json();
        form.reset(task);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [form, taskId]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-orange-700">Edit Task</h1>

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
                  A brief description of what your task involves.
                </FormDescription>
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
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="ON_HOLD">On Hold</SelectItem>
                      <SelectItem value="BLOCKED">Blocked</SelectItem>
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

          <div className="flex gap-x-2">
            <Button type="submit">Save</Button>
            <Button asChild type="button" variant="outline">
              <Link href={`/projects/${projectId}?tab=tasks`}>Cancel</Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default TaskEditPage;
