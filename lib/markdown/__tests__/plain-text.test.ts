import { describe, it, expect } from "vitest";
import { markdownToPlainText } from "../plain-text";

describe("markdownToPlainText", () => {
  // Formatting is removed and the words a reader sees stay joined up, so a
  // search phrase matches across formatting.
  it.each([
    ["bold mid-phrase", "the **quick** brown fox", "the quick brown fox"],
    ["bold inside a word", "**quick**ly done", "quickly done"],
    ["italic, both markers", "*one* and _two_", "one and two"],
    ["strikethrough", "~~old~~ new", "old new"],
    ["inline code", "run `npm test` now", "run npm test now"],
    ["link keeps its text, drops the URL", "see [the docs](https://example.com/x) here", "see the docs here"],
    ["bare URL is not escaped", "go to https://example.com/a_b now", "go to https://example.com/a_b now"],
    ["heading", "## Release plan\n\nShip it", "Release plan Ship it"],
    ["bullet list", "- first item\n- second item", "first item second item"],
    ["numbered list", "1. alpha\n2. beta", "alpha beta"],
    ["quote", "> quoted words", "quoted words"],
    ["code block keeps its text", "intro\n\n```js\nconst answer = 42\n```", "intro const answer = 42"],
    ["table cells", "| Name | Owner |\n|---|---|\n| Boron | Steve |", "Name Owner Boron Steve"],
    ["image keeps its alt text", "before ![diagram of flow](a.png) after", "before diagram of flow after"],
  ])("%s", (_label, markdown, expected) => {
    expect(markdownToPlainText(markdown)).toBe(expected);
  });

  // Raw HTML is shown on the page as literal text, so it is indexed the same way
  // and never swallows the text around it.
  it.each([
    ["block of HTML", "<script>alert(1)</script> after", "<script>alert(1)</script> after"],
    ["inline HTML", "x <b>bold</b> y", "x <b>bold</b> y"],
  ])("keeps %s as text", (_label, markdown, expected) => {
    expect(markdownToPlainText(markdown)).toBe(expected);
  });

  // Existing plain-text descriptions keep all their words.
  it("collapses line breaks and paragraphs into single spaces", () => {
    expect(markdownToPlainText("Line one\nline two\n\n\nNew  paragraph")).toBe(
      "Line one line two New paragraph"
    );
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["empty", ""],
    ["whitespace only", "  \n\n "],
  ])("returns an empty string for %s", (_label, input) => {
    expect(markdownToPlainText(input)).toBe("");
  });
});
