import { FC } from "react";
import { ProjectPriority } from "@/types/entities";
import { Badge } from "@/components/ui/badge";
import { translate } from "@/lib/utils";

export const ProjectPriorityBadge: FC<{ priority: ProjectPriority }> = ({
  priority,
}) => {
  return (
    <Badge className="bg-orange-100 text-orange-700">
      {translate(priority)}
    </Badge>
  );
};
