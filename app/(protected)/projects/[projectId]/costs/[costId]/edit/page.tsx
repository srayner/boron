"use client";

import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRecentProjects } from "@/app/context/recent-projects-context";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerField } from "@/components/ui/form/date-picker-field";
import Link from "next/link";
import { TagField } from "@/components/ui/form/TagField";
import { Cost } from "@/types/entities";
import { TextAreaField } from "@/components/ui/form/TextAreaField";
import { TextField } from "@/components/ui/form/TextField";
import { getReturnUrl } from "@/lib/navigation";

type ProjectCostEditPageProps = {
  params: Promise<{ projectId: string; costId: string }>;
};

const ProjectCostEditPage: NextPage<ProjectCostEditPageProps> = ({
  params,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? "";
  const { refreshRecentProjects } = useRecentProjects();
  const { projectId, costId } = React.use(params);
  const [originalCost, setOriginalCost] = useState<Cost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const formSchema = z.object({
    name: z.string().max(250).optional(),
    description: z.string().max(250).optional(),
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

    date: z.coerce.date().optional(),
    tags: z.string().nullable(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      type: "PARTS",
      name: "",
      description: "",
      date: undefined,
      tags: null,
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
      router.push(
        getReturnUrl(returnTo, {
          projectId: originalCost?.projectId,
          costId,
        })
      );
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

        const { cost } = (await costResponse.json()) as {
          cost: Cost;
        };

        setOriginalCost(cost);

        const formData = {
          amount: cost.amount,
          type: cost.type,
          name: cost.name,
          description: cost.description,
          date: cost.date ? new Date(cost.date) : undefined,
          tags: cost.tags.map((t) => t.name).join(", "),
        };
        form.reset(formData);
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
      <h1 className="text-2xl font-semibold text-orange-700">Edit Cost</h1>

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
            name="date"
            render={({ field }) => (
              <DatePickerField field={field} label="Date" />
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => <TagField field={field} label="Tags" />}
          />

          <div className="flex gap-x-2">
            <Button type="submit">Save</Button>
            <Button asChild type="button" variant="outline">
              <Link
                href={getReturnUrl(returnTo, {
                  projectId: originalCost?.projectId,
                  costId,
                })}
              >
                Cancel
              </Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProjectCostEditPage;
