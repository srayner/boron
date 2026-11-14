import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarkdownContent } from "@/components/markdown/MarkdownContent";

describe("MarkdownContent", () => {
  // Descriptions can come from the API/MCP, so anything in them is untrusted.
  describe("unsafe content", () => {
    it.each([
      ["script tag", "before <script>window.hacked = 1</script> after", "<script>window.hacked = 1</script>"],
      ["image with onerror", 'x <img src="nope" onerror="window.hacked = 1"> y', '<img src="nope" onerror="window.hacked = 1">'],
      ["iframe", '<iframe src="https://example.com"></iframe>', '<iframe src="https://example.com"></iframe>'],
    ])("shows a %s as text instead of markup", (_label, markdown, literal) => {
      const { container } = render(<MarkdownContent markdown={markdown} />);

      expect(container.querySelector("script, img, iframe, [onerror]")).toBeNull();
      expect(container.textContent).toContain(literal);
    });

    it.each([
      ["javascript:", "[click me](javascript:alert(1))"],
      ["JavaScript: in mixed case", "[click me](JavaScript:alert(1))"],
      ["vbscript:", "[click me](vbscript:msgbox(1))"],
      ["data:", "[click me](data:text/html;base64,PHNjcmlwdD4=)"],
    ])("never links to a %s URL", (_label, markdown) => {
      render(<MarkdownContent markdown={markdown} />);

      const link = screen.getByText("click me").closest("a");
      expect(link?.getAttribute("href") ?? "").toBe("");
    });

    it("keeps ordinary links", () => {
      render(<MarkdownContent markdown="[docs](https://example.com/a?b=1)" />);

      expect(screen.getByRole("link", { name: "docs" })).toHaveAttribute("href", "https://example.com/a?b=1");
    });
  });

  // Descriptions written before Markdown support are plain text with newlines.
  describe("existing plain-text descriptions", () => {
    it("keeps single line breaks and separate paragraphs", () => {
      const { container } = render(
        <MarkdownContent markdown={"First line\nSecond line\n\nNew paragraph"} />
      );

      const paragraphs = container.querySelectorAll("p");
      expect(paragraphs).toHaveLength(2);
      expect(paragraphs[0].querySelectorAll("br")).toHaveLength(1);
      expect(paragraphs[0].textContent).toBe("First line\nSecond line");
      expect(paragraphs[1].textContent).toBe("New paragraph");
    });
  });

  it("renders Markdown formatting as elements", () => {
    const { container } = render(
      <MarkdownContent markdown={"## Plan\n\n- **bold** item\n- `code`\n\n1. first"} />
    );

    expect(screen.getByRole("heading", { level: 2, name: "Plan" })).toBeInTheDocument();
    expect(container.querySelectorAll("ul > li")).toHaveLength(2);
    expect(container.querySelector("ol > li")?.textContent).toBe("first");
    expect(container.querySelector("strong")?.textContent).toBe("bold");
    expect(container.querySelector("code")?.textContent).toBe("code");
  });
});
