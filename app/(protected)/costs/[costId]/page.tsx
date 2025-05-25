"use client";

import React, { use, useEffect, useState } from "react";
import { NextPage } from "next";
import { Cost } from "@/types/entities";
import { formatCurrency } from "@/lib/utils";
import { PoundSterling } from "lucide-react";
import { CostStatusBadge } from "@/components/costs/CostStatusBadge";
import { format, formatDistanceToNow } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { TagsList } from "@/components/tags/TagsList";

type CostPageProps = {
  params: Promise<{ costId: string }>;
};

const CostDetailPage: NextPage<CostPageProps> = ({ params }) => {
  const { costId } = use(params);
  const [cost, setCost] = useState<Cost | null>(null);
  const noteFallback = "Cost note not provided.";
  const fetchCost = async () => {
    const response = await fetch(`/api/costs/${costId}`);
    const { cost } = await response.json();
    setCost(cost);
  };

  useEffect(() => {
    fetchCost();
  }, []);

  if (!cost) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        {/* Left side*/}
        <div className="flex items-center gap-4">
          <PoundSterling className="h-12 w-12 text-primary" />
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold text-primary">
              Cost of {formatCurrency(cost.amount)}
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
      </div>

      <Separator className="my-3" />

      {/* Description and tags */}
      <p className="my-3">{cost.note || noteFallback}</p>
      <TagsList tags={cost.tags} />
    </div>
  );
};

export default CostDetailPage;
