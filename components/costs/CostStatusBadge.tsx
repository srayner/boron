import { FC } from "react";
import { Badge } from "@/components/ui/badge";

export const CostStatusBadge: FC<{ status: string }> = ({ status }) => {
  return <Badge className="bg-orange-100 text-orange-700">{status}</Badge>;
};
