import { formatDate, translate } from "@/lib/utils";
import { Task } from "@/types/entities";
import { Pencil, Trash2 } from "lucide-react";
import { Link } from "../ui/link";
import { DeleteInfo } from "@/types/ui";
import { ProgressBar } from "../ui/ProgressBar";

type TaskTableProps = {
  tasks: Task[];
  onDelete: (info: DeleteInfo) => void;
  returnTo: string;
  emptyMessage?: string;
};

const TasksTable = ({
  tasks,
  onDelete,
  returnTo,
  emptyMessage = "No tasks exist yet.",
}: TaskTableProps) => {
  return (
    <table className="w-full text-sm border">
      <thead>
        <tr className="bg-muted text-muted-foreground">
          <th className="text-left p-2">Name</th>
          <th className="text-left p-2">Status</th>
          <th className="text-left p-2">Progress</th>
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
            <td className="p-2 pb-1.5">
              {`${task.progress}%`}
              <ProgressBar percent={task.progress} height={8} />
            </td>
            <td className="p-2">{translate(task.priority)}</td>
            <td className="p-2">{translate(task.milestone?.name || "")}</td>
            <td className="p-2">{formatDate(task.startDate)}</td>
            <td className="p-2">{formatDate(task.dueDate)}</td>
            <td className="p-2">
              <div className="flex gap-2">
                <Link
                  href={`/projects/${task.projectId}/tasks/${task.id}/edit?returnTo=${returnTo}`}
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
              </div>
            </td>
          </tr>
        ))}
        {tasks.length === 0 && (
          <tr>
            <td colSpan={8} className="text-center text-muted-foreground py-4">
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default TasksTable;
