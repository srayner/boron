import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { cn } from "@/lib/utils";

// remark-breaks keeps single line breaks, so descriptions written as plain
// text before Markdown support still show their lines. Raw HTML is shown as
// text and unsafe URLs (javascript: and the like) are removed by react-markdown's
// defaults, which are deliberately left on.
const remarkPlugins = [remarkGfm, remarkBreaks];

export function MarkdownContent({
  markdown,
  className,
}: {
  markdown: string;
  className?: string;
}) {
  return (
    <div className={cn("markdown", className)}>
      <Markdown remarkPlugins={remarkPlugins}>{markdown}</Markdown>
    </div>
  );
}
