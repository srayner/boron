"use client";

import React from "react";
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
import { NextPage } from "next";

type ProjectCostAddPageProps = {
  params: Promise<{ projectId: string }>;
};

const ProjectCostAddPage: NextPage<ProjectCostAddPageProps> = ({ params }) => {
  const router = useRouter();
  const { refreshRecentProjects } = useRecentProjects();

  const { projectId } = React.use(params);

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
    taskId: z.string().optional(),
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
      const response = await fetch("/api/costs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to create cost");
      }

      refreshRecentProjects();
      router.push(`/projects/${projectId}?tab=costs`);
    } catch (error) {
      console.error("Error creating cost:", error);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-orange-700">Create Cost</h1>

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

          <Button type="submit">Create</Button>
        </form>
      </Form>
    </div>
  );
};

export default ProjectCostAddPage;
