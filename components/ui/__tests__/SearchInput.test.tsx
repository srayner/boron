import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchInput from "@/components/ui/SearchInput";

describe("SearchInput", () => {
  it("shows the current search value and placeholder", () => {
    render(
      <SearchInput search="widgets" placeholder="Search…" onSearchChange={vi.fn()} />
    );

    const input = screen.getByPlaceholderText("Search…");
    expect(input).toHaveValue("widgets");
  });

  it("calls onSearchChange with the typed value as the user types", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();

    render(<SearchInput search="" placeholder="Search…" onSearchChange={onSearchChange} />);

    await user.type(screen.getByPlaceholderText("Search…"), "abc");

    expect(onSearchChange).toHaveBeenCalledTimes(3);
    expect(onSearchChange).toHaveBeenNthCalledWith(1, "a");
    expect(onSearchChange).toHaveBeenNthCalledWith(2, "b");
    expect(onSearchChange).toHaveBeenNthCalledWith(3, "c");
  });
});
