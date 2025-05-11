import { FC } from "react";
import { ProjectStatus } from "@/types/entities";
import { Badge } from "@/components/ui/badge";

const formatProjectStatus = (status: ProjectStatus) => {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

export const ProjectStatusBadge: FC<{ status: ProjectStatus }> = ({
  status,
}) => {
  return (
    <Badge className="bg-orange-100 text-orange-700">
      {formatProjectStatus(status)}
    </Badge>
  );
};
