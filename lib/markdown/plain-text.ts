import { remark } from "remark";
import remarkGfm from "remark-gfm";
import type { Nodes, Parents } from "mdast";

const parser = remark().use(remarkGfm);

// Nodes that sit inside a line of text. Every other node starts a new block,
// so its text is separated from its neighbours by a space.
const inlineTypes = new Set([
  "text",
  "emphasis",
  "strong",
  "delete",
  "inlineCode",
  "link",
  "linkReference",
  "html",
]);

function collect(node: Nodes, out: string[]) {
  const isBlock = !inlineTypes.has(node.type);
  if (isBlock) out.push(" ");
  if (node.type === "image" || node.type === "imageReference") {
    out.push(node.alt ?? "");
  } else if ("value" in node) {
    // text, inline code, code blocks and raw HTML (shown as literal text)
    out.push(node.value);
  } else if ("children" in node) {
    for (const child of (node as Parents).children) collect(child, out);
  }
  if (isBlock) out.push(" ");
}

/**
 * Markdown to the text a reader sees, on one line: formatting symbols removed
 * and all whitespace collapsed, so a phrase matches across bold, links, list
 * items and headings. Used for the search index and for description excerpts.
 */
export function markdownToPlainText(markdown: string | null | undefined): string {
  if (!markdown) return "";
  const out: string[] = [];
  collect(parser.parse(markdown), out);
  return out.join("").replace(/\s+/g, " ").trim();
}
