import { FC } from "react";
import { ProjectStatus } from "@/types/entities";
import { Badge } from "@/components/ui/badge";
import { translate } from "@/lib/utils";

export const ProjectStatusBadge: FC<{ status: ProjectStatus }> = ({
  status,
}) => {
  return (
    <Badge className="bg-orange-100 text-orange-700">{translate(status)}</Badge>
  );
};
