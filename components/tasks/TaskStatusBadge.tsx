import { FC } from "react";
import { TaskStatus } from "@/types/entities";
import { Badge } from "@/components/ui/badge";
import { translate } from "@/lib/utils";

export const TaskStatusBadge: FC<{ status: TaskStatus }> = ({ status }) => {
  return (
    <Badge className="bg-orange-100 text-orange-700">{translate(status)}</Badge>
  );
};
