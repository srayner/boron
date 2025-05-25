import { FC } from "react";
import { MilestoneStatus } from "@/types/entities";
import { Badge } from "@/components/ui/badge";

const formatProjectStatus = (status: MilestoneStatus) => {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

export const MilestoneStatusBadge: FC<{ status: MilestoneStatus }> = ({
  status,
}) => {
  return (
    <Badge className="bg-orange-100 text-orange-700">
      {formatProjectStatus(status)}
    </Badge>
  );
};
