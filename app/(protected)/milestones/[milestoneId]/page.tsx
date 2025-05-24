"use client";

import React, { use, useEffect, useState } from "react";
import { NextPage } from "next";
import { Milestone } from "@/types/entities";

type MilestonePageProps = {
  params: Promise<{ milestoneId: string }>;
};

const MilestoneDetailPage: NextPage<MilestonePageProps> = ({ params }) => {
  const { milestoneId } = use(params);
  const [milestone, setMilestone] = useState<Milestone | null>(null);

  const fetchMilestone = async () => {
    const response = await fetch(`/api/milestones/${milestoneId}`);
    const { milestone } = await response.json();
    setMilestone(milestone);
  };

  useEffect(() => {
    fetchMilestone();
  }, []);

  if (!milestone) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">
            {milestone.name}
          </h1>
        </div>
      </div>
    </div>
  );
};

export default MilestoneDetailPage;
