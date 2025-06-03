import { FC } from "react";
import { MilestoneStatus } from "@/types/entities";
import { Badge } from "@/components/ui/badge";
import { translate } from "@/lib/utils";

export const MilestoneStatusBadge: FC<{ status: MilestoneStatus }> = ({
  status,
}) => {
  return (
    <Badge className="bg-orange-100 text-orange-700">{translate(status)}</Badge>
  );
};
