"use client";

import React, { use, useEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/navigation";
import { Cost } from "@/types/entities";
import { formatCurrency } from "@/lib/utils";
import { PoundSterling, Info, Calendar, Pencil, Trash2 } from "lucide-react";
import { CostStatusBadge } from "@/components/costs/CostStatusBadge";
import { format, formatDistanceToNow } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { TagsList } from "@/components/tags/TagsList";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { useRecentProjects } from "@/app/context/recent-projects-context";
import { DeletableType, DeleteInfo } from "@/types/ui";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

type CostPageProps = {
  params: Promise<{ costId: string }>;
};

const CostDetailPage: NextPage<CostPageProps> = ({ params }) => {
  const router = useRouter();
  const { costId } = use(params);
  const [cost, setCost] = useState<Cost | null>(null);
  const descriptionFallback = "Cost description not provided.";
  const { refreshRecentProjects } = useRecentProjects();
  const [deleteInfo, setDeleteInfo] = useState<DeleteInfo | null>(null);
  const isConfirmOpen = !!deleteInfo;
  const fetchCost = async () => {
    const response = await fetch(`/api/costs/${costId}`);
    const { cost } = await response.json();
    setCost(cost);
  };

  useEffect(() => {
    fetchCost();
  }, []);

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

    if (deleteInfo.type === "cost") {
      router.push(`/projects/${cost!.project.id}?tab=costs`);
    } else {
      fetchCost();
    }
  };

  if (!cost) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        {/* Left side*/}
        <div className="flex items-center gap-4">
          <PoundSterling className="h-12 w-12 text-primary" />
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold text-primary">
              {cost.name || `Cost of ${formatCurrency(cost.amount)}`}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <CostStatusBadge status="Added" />
              <span>
                Updated{" "}
                {formatDistanceToNow(new Date(cost.updatedAt), {
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
              router.push(
                `/projects/${cost.project.id}/costs/${costId}/edit?returnTo=cost`
              )
            }
            className="flex items-center"
          >
            <Pencil className="w-4 h-4 mr-1" /> Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() =>
              setDeleteInfo({
                type: "cost",
                item: {
                  ...cost,
                  name: `${cost.type} - ${formatCurrency(cost.amount)}`,
                },
              })
            }
            className="flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </Button>
        </div>
      </div>

      <Separator className="my-3" />

      {/* Description and tags */}
      <p className="my-3">{cost.description || descriptionFallback}</p>
      <TagsList tags={cost.tags} />

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card className="py-4">
          <CardContent>
            <h3 className="text-muted-foreground flex items-center gap-2">
              <Info className="w-4 h-4" /> Summary
            </h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-4">
              <dt className="font-medium text-muted-foreground">Project:</dt>
              <dd className="text-foreground">
                <Link href={`/projects/${cost.project.id}`}>
                  {cost.project.name}
                </Link>
              </dd>
              <dt className="font-medium text-muted-foreground">Amount:</dt>
              <dd className="text-foreground">{formatCurrency(cost.amount)}</dd>
              <dt className="font-medium text-muted-foreground">Status:</dt>
              <dd className="text-foreground">Added</dd>
            </dl>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent>
            <h3 className="text-muted-foreground mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Dates
            </h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-4">
              <dt className="font-medium text-muted-foreground">Date:</dt>
              <dd className="text-foreground">
                {cost.date
                  ? format(new Date(cost.date), "dd MMM yyyy")
                  : "No start date"}
              </dd>
            </dl>
          </CardContent>
        </Card>
      </div>

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

export default CostDetailPage;
