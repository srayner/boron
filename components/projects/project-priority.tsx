import { FC } from "react";
import { ProjectPriority } from "@/types/entities";
import { translate } from "@/lib/utils";

const priorityColors: Record<ProjectPriority, string> = {
  CRITICAL: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-yellow-500",
  LOW: "bg-green-500",
};

export const ProjectPriorityBadge: FC<{ priority: ProjectPriority }> = ({
  priority,
}) => {
  const colorClass = priorityColors[priority] || "bg-gray-400";

  return (
    <span className="inline-flex items-center gap-2">
      <span className={`rounded-full h-3 w-3 ${colorClass}`} />
      <span className="text-muted-foreground">{translate(priority)}</span>
    </span>
  );
};
