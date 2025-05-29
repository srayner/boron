import { FC } from "react";
import { formatDate, translate } from "@/lib/utils";
import { Task } from "@/types/entities";
import { Pencil, Trash2 } from "lucide-react";
import { Link } from "../ui/link";

type TaskTableProps<TType, TItem> = {
  tasks: Task[];
  onDelete: (args: { type: TType; item: TItem }) => void;
};

const TasksTable = <TType, TItem>({
  tasks,
  onDelete,
}: TaskTableProps<TType, TItem>) => {
  return (
    <table className="w-full text-sm border">
      <thead>
        <tr className="bg-muted text-muted-foreground">
          <th className="text-left p-2">Name</th>
          <th className="text-left p-2">Status</th>
          <th className="text-left p-2">Priority</th>
          <th className="text-left p-2">Milestone</th>
          <th className="text-left p-2">Start Date</th>
          <th className="text-left p-2">Due Date</th>
          <th className="text-left p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.id} className="border-t">
            <td className="p-2">
              <Link href={`/tasks/${task.id}`}>{task.name}</Link>
            </td>
            <td className="p-2">{translate(task.status)}</td>
            <td className="p-2">{translate(task.priority)}</td>
            <td className="p-2">{translate(task.milestone?.name || "")}</td>
            <td className="p-2">{formatDate(task.startDate)}</td>
            <td className="p-2">{formatDate(task.dueDate)}</td>
            <td className="p-2 flex gap-2">
              <Link
                href={`/projects/${task.projectId}/tasks/${task.id}/edit`}
                className="text-forground"
              >
                <Pencil className="w-4 h-4 hover:text-primary" />
              </Link>
              <button
                onClick={() => {
                  onDelete({ type: "task", item: task });
                }}
              >
                <Trash2 className="w-4 h-4 hover:text-destructive" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TasksTable;
