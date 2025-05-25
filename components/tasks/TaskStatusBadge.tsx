import { FC } from "react";
import { TaskStatus } from "@/types/entities";
import { Badge } from "@/components/ui/badge";

const formatProjectStatus = (status: TaskStatus) => {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

export const TaskStatusBadge: FC<{ status: TaskStatus }> = ({ status }) => {
  return (
    <Badge className="bg-orange-100 text-orange-700">
      {formatProjectStatus(status)}
    </Badge>
  );
};
