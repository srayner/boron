import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskStatusBadge } from "@/components/tasks/TaskStatusBadge";

describe("TaskStatusBadge", () => {
  it("renders the translated status text", () => {
    render(<TaskStatusBadge status="IN_PROGRESS" />);

    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("translates each known status independently", () => {
    render(<TaskStatusBadge status="COMPLETED" />);

    expect(screen.getByText("Completed")).toBeInTheDocument();
  });
});
