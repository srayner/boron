import React from "react";
import { Task, TaskSummary } from "@/types/entities";

interface TaskDashboardWidgetProps {
  tasks: Task[];
  summary: TaskSummary | null;
}

export function TaskDashboardWidget({
  tasks,
  summary,
}: TaskDashboardWidgetProps) {
  return (
    <section
      className="p-4 rounded-md"
      style={{
        backgroundColor: "var(--color-card)",
        color: "var(--color-card-foreground)",
        border: "1px solid var(--color-border)",
      }}
    >
      <h2
        className="text-lg font-semibold mb-4"
        style={{ color: "var(--color-card-foreground)" }}
      >
        Upcoming Tasks
      </h2>

      {summary && summary?.overdueCount > 0 && (
        <div className="mb-4 p-3 border border-red-500 rounded-md bg-red-50 dark:bg-red-900">
          <p className="text-red-700 dark:text-red-300 font-semibold cursor-pointer">
            {summary.overdueCount} overdue task
            {summary.overdueCount > 1 ? "s" : ""}
          </p>
        </div>
      )}

      {tasks.length === 0 ? (
        <p style={{ color: "var(--color-muted-foreground)" }}>
          No upcoming tasks.
        </p>
      ) : (
        <ul className="space-y-3">
          {tasks.map(({ id, name, dueDate, project, priority }) => (
            <li
              key={id}
              style={{
                padding: "0.75rem",
                border: "1px solid var(--color-border)",
                borderRadius: "0.375rem",
                cursor: "pointer",
                backgroundColor: "var(--color-card)",
                color: "var(--color-card-foreground)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--color-muted)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--color-card)")
              }
            >
              <div className="flex justify-between items-start">
                <p style={{ fontWeight: 600 }}>{name}</p>
                <span
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor:
                      priority === "CRITICAL"
                        ? "var(--color-destructive)"
                        : priority === "HIGH"
                          ? "var(--color-warning)"
                          : "var(--color-muted)",
                    color:
                      priority === "CRITICAL" || priority === "HIGH"
                        ? "white"
                        : "var(--color-muted-foreground)",
                  }}
                >
                  {priority}
                </span>
              </div>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-muted-foreground)",
                }}
              >
                Due:{" "}
                {dueDate
                  ? new Date(dueDate).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                  : "No due date"}{" "}
                &middot; Project: {project.name}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
