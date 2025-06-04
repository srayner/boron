import { formatDate, translate } from "@/lib/utils";
import { Milestone } from "@/types/entities";
import { Pencil, Trash2 } from "lucide-react";
import { Link } from "../ui/link";
import { DeleteInfo } from "@/types/ui";
import { ProgressBar } from "../ui/ProgressBar";

type Props = {
  milestones: Milestone[];
  onDelete: (info: DeleteInfo) => void;
  returnTo: string;
};

const MilestonesTable = ({ milestones, onDelete, returnTo }: Props) => {
  return (
    <table className="w-full text-sm border">
      <thead>
        <tr className="bg-muted text-muted-foreground">
          <th className="text-left p-2">Name</th>
          <th className="text-left p-2">Status</th>
          <th className="text-left p-2">Progress</th>
          <th className="text-left p-2">Order</th>
          <th className="text-left p-2">Due Date</th>
          <th className="text-left p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {milestones.map((milestone) => (
          <tr key={milestone.id} className="border-t">
            <td className="p-2">
              <Link href={`/milestones/${milestone.id}`}>{milestone.name}</Link>
            </td>
            <td className="p-2">{translate(milestone.status)}</td>
            <td className="p-2 pb-1.5">
              {`${milestone.progress}%`}
              <ProgressBar percent={milestone.progress} height={8} />
            </td>
            <td className="p-2">{milestone.order}</td>
            <td className="p-2">{formatDate(milestone.dueDate)}</td>
            <td className="p-2">
              <div className="flex gap-2">
                <Link
                  href={`/projects/${milestone.projectId}/milestones/${milestone.id}/edit?returnTo=${returnTo}`}
                  className="text-forground"
                >
                  <Pencil className="w-4 h-4 hover:text-primary" />
                </Link>
                <button
                  onClick={() => {
                    onDelete({ type: "milestone", item: milestone });
                  }}
                >
                  <Trash2 className="w-4 h-4 hover:text-destructive" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default MilestonesTable;
