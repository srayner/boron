import React from "react";
import { Project, Milestone, MilestoneSummary } from "@/types/entities";

interface MilestoneDashboardWidgetProps {
  milestones: Milestone[];
  summary: MilestoneSummary | null;
}

export function MilestoneDashboardWidget({
  milestones,
  summary,
}: MilestoneDashboardWidgetProps) {
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
        Upcoming Milestones
      </h2>

      {summary?.overdueCount > 0 && (
        <div className="mb-4 p-3 border border-red-500 rounded-md bg-red-50 dark:bg-red-900">
          <p className="text-red-700 dark:text-red-300 font-semibold cursor-pointer">
            {summary.overdueCount} overdue milestone
            {summary.overdueCount > 1 ? "s" : ""}
          </p>
        </div>
      )}

      {milestones.length === 0 ? (
        <p style={{ color: "var(--color-muted-foreground)" }}>
          No upcoming milestones.
        </p>
      ) : (
        <ul className="space-y-3">
          {milestones.map(({ id, name, dueDate, project }) => (
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
              <p style={{ fontWeight: 600 }}>{name}</p>
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
