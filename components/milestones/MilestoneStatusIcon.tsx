"use client";

import React from "react";
import { Circle, CircleCheck, CircleAlert, Clock4 } from "lucide-react";
import { Milestone } from "@/types/entities";

type Status =
  | "noDueDate"
  | "completedOnTime"
  | "completedLate"
  | "overdue"
  | "dueSoon"
  | "neutral";

function getStatus(milestone: Milestone): Status {
  if (!milestone.dueDate) return "noDueDate";

  const now = new Date();
  const due = new Date(milestone.dueDate);
  const completed = milestone.status === "COMPLETED";
  const completedAt = new Date(milestone.completedAt);

  if (completed) {
    if (completedAt <= due) return "completedOnTime";
    else return "completedLate";
  }

  if (due < now) return "overdue";

  const diffMs = due.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays >= 0 && diffDays <= 3) return "dueSoon";

  return "neutral";
}

interface MilestoneStatusIconProps {
  milestone: Milestone;
  className?: string;
}

export function MilestoneStatusIcon({ milestone }: MilestoneStatusIconProps) {
  const status = getStatus(milestone);

  if (status === "noDueDate") return null;

  // Defaults for icon and color
  let Icon = Circle;
  let color = "text-gray-400";
  let title = "No status";

  switch (status) {
    case "completedOnTime":
      Icon = CircleCheck;
      color = "text-green-600";
      title = "Completed on time";
      break;
    case "completedLate":
      Icon = CircleCheck;
      color = "text-yellow-600";
      title = "Completed late";
      break;
    case "overdue":
      Icon = CircleAlert;
      color = "text-red-600";
      title = "Overdue";
      break;
    case "dueSoon":
      Icon = Clock4;
      color = "text-orange-500";
      title = "Due soon";
      break;
    case "neutral":
      Icon = Circle;
      color = "text-gray-400";
      title = "No urgency";
      break;
  }

  return (
    <span title={title}>
      <Icon className={`${color} h-5 w-5`} aria-label={title} />
    </span>
  );
}
