import { formatCurrency, formatDate, translate } from "@/lib/utils";
import { Cost } from "@/types/entities";
import { Pencil, Trash2 } from "lucide-react";
import { Link } from "../ui/link";
import { DeleteInfo } from "@/types/ui";

type CostTableProps = {
  costs: Cost[];
  onDelete: (info: DeleteInfo) => void;
  returnTo: string;
};

const CostsTable = ({ costs, onDelete, returnTo }: CostTableProps) => {
  return (
    <table className="w-full text-sm border">
      <thead>
        <tr className="bg-muted text-muted-foreground">
          <th className="text-left p-2">Date</th>
          <th className="text-left p-2">Amount</th>
          <th className="text-left p-2">Type</th>
          <th className="text-left p-2">Note</th>
          <th className="text-left p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {costs.map((cost) => (
          <tr key={cost.id} className="border-t">
            <td className="p-2">{formatDate(cost.date)}</td>
            <td className="p-2">
              <Link className="text-primary" href={`/costs/${cost.id}`}>
                {formatCurrency(cost.amount)}
              </Link>
            </td>
            <td className="p-2">{translate(cost.type)}</td>
            <td className="p-2">{cost.note}</td>
            <td className="p-2 flex gap-2">
              <Link
                href={`/projects/${cost.projectId}/costs/${cost.id}/edit?returnTo=${returnTo}`}
                className="text-forground"
              >
                <Pencil className="w-4 h-4 hover:text-primary" />
              </Link>
              <button
                onClick={() => {
                  onDelete({
                    type: "cost",
                    item: {
                      ...cost,
                      name: `${cost.type} - $${cost.amount}`,
                    },
                  });
                }}
              >
                <Trash2 className="w-4 h-4 hover:text-destructive" />
              </button>
            </td>
          </tr>
        ))}
        {costs.length === 0 && (
          <tr>
            <td colSpan={5} className="text-center text-muted-foreground py-4">
              No costs exist yet.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default CostsTable;
