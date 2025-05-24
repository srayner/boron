"use client";

import React, { use, useEffect, useState } from "react";
import { NextPage } from "next";
import { Cost } from "@/types/entities";
import { formatCurrency } from "@/lib/utils";

type CostPageProps = {
  params: Promise<{ costId: string }>;
};

const CostDetailPage: NextPage<CostPageProps> = ({ params }) => {
  const { costId } = use(params);
  const [cost, setCost] = useState<Cost | null>(null);

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
        <div>
          <h1 className="text-2xl font-semibold text-primary">
            Cost: {formatCurrency(cost.amount)}
          </h1>
        </div>
      </div>
    </div>
  );
};

export default CostDetailPage;
