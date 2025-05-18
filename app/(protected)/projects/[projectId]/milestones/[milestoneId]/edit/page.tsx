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

type MilestoneEditPageProps = {
  params: Promise<{ projectId: string; milestoneId: string }>;
};

const MilestoneEditPage: NextPage<MilestoneEditPageProps> = ({ params }) => {
  const router = useRouter();
  const { refreshRecentProjects } = useRecentProjects();
  const { projectId, milestoneId } = React.use(params);
  const [isLoading, setIsLoading] = useState(true);

  const formSchema = z.object({
    name: z.string().min(1, {
      message: "Name is required.",
    }),
    description: z.string().nullable(),
    status: z.string(),
    order: z.number().nullable(),
    dueDate: z.coerce.date().nullable(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: null,
      order: null,
      status: "PLANNED",
      dueDate: null,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      projectId,
      ...values,
      dueDate: values.dueDate ? values.dueDate.toISOString() : null,
    };
    try {
      const response = await fetch(`/api/milestones/${milestoneId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update milestone");
      }

      refreshRecentProjects();
      router.push(`/projects/${projectId}?tab=milestones`);
    } catch (error) {
      console.error("Error updating milestone:", error);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [milestoneResponse] = await Promise.all([
          fetch(`/api/milestones/${milestoneId}`),
        ]);

        if (!milestoneResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const { milestone } = await milestoneResponse.json();
        form.reset(milestone);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [form, milestoneId]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-orange-700">Edit Milestone</h1>

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
                  A brief description of what your milestone involves.
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
            name="order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order</FormLabel>
                <FormControl>
                  <Input
                    className="w-[240px]"
                    type="number"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(
                        val === "" ? undefined : parseInt(val, 10)
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
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
              <Link href={`/projects/${projectId}?tab=milestones`}>Cancel</Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default MilestoneEditPage;
