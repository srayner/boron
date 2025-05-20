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

type ProjectCostEditPageProps = {
  params: Promise<{ projectId: string; costId: string }>;
};

const ProjectCostEditPage: NextPage<ProjectCostEditPageProps> = ({
  params,
}) => {
  const router = useRouter();
  const { refreshRecentProjects } = useRecentProjects();
  const { projectId, costId } = React.use(params);
  const [isLoading, setIsLoading] = useState(true);

  const formSchema = z.object({
    amount: z.coerce.number().min(0),
    type: z.enum([
      "PARTS",
      "LABOR",
      "SOFTWARE",
      "TOOLS",
      "CONSUMABLES",
      "TRAVEL",
      "MISC",
    ]),
    note: z.string().max(250).optional(),
    date: z.coerce.date().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      type: "PARTS",
      note: "",
      date: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      projectId,
      ...values,
      date: values.date ? values.date.toISOString() : null,
    };
    try {
      const response = await fetch(`/api/costs/${costId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update cost");
      }

      refreshRecentProjects();
      router.push(`/projects/${projectId}?tab=costs`);
    } catch (error) {
      console.error("Error updating cost:", error);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [costResponse] = await Promise.all([
          fetch(`/api/costs/${costId}`),
        ]);

        if (!costResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const { cost } = await costResponse.json();
        form.reset(cost);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [form, costId]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-orange-700">Edit Milestone</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
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
                      <SelectItem value="PARTS">Parts</SelectItem>
                      <SelectItem value="LABOR">Labor</SelectItem>
                      <SelectItem value="SOFTWARE">Software</SelectItem>
                      <SelectItem value="TOOLS">Tools</SelectItem>
                      <SelectItem value="CONSUMERBLES">Consumerbles</SelectItem>
                      <SelectItem value="MISC">Misc</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note</FormLabel>
                <FormControl>
                  <Textarea
                    className="h-32"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>
                  A brief note of what this cost is for.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <DatePickerField field={field} label="Date" />
            )}
          />

          <div className="flex gap-x-2">
            <Button type="submit">Save</Button>
            <Button asChild type="button" variant="outline">
              <Link href={`/projects/${projectId}?tab=costs`}>Cancel</Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProjectCostEditPage;
