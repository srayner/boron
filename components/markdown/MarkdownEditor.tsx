"use client";

import "@mdxeditor/editor/style.css";
import { useState } from "react";
import {
  MDXEditor,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  InsertCodeBlock,
  ListsToggle,
  Separator,
  UndoRedo,
  codeBlockPlugin,
  codeMirrorPlugin,
  createRootEditorSubscription$,
  headingsPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  realmPlugin,
  rootEditor$,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";

export type MarkdownEditorProps = {
  /** The Markdown to start with. Read once, when the editor mounts. */
  markdown: string;
  /** Called with the new Markdown after each edit by the user. */
  onChange: (markdown: string) => void;
  /** Called when the starting Markdown has something the editor can't show. */
  onParseError: () => void;
  onBlur?: () => void;
  labelId: string;
  describedBy: string;
  invalid: boolean;
};

type FieldAttributes = Pick<MarkdownEditorProps, "labelId" | "describedBy" | "invalid">;

function applyFieldAttributes(root: HTMLElement | null, attrs: FieldAttributes) {
  if (!root) return;
  root.setAttribute("aria-labelledby", attrs.labelId);
  root.setAttribute("aria-describedby", attrs.describedBy);
  root.setAttribute("aria-invalid", String(attrs.invalid));
  root.setAttribute("aria-multiline", "true");
}

// MDXEditor has no props for these, so this plugin puts them on its editable
// area: the form label names it, and the help text and errors describe it.
// Lexical's root listener fires whenever the editable element attaches, and
// update() runs on every render, so the attributes always match the field.
// One plugin per editor, because it remembers that editor's latest values.
function createFieldAttributesPlugin() {
  let current: FieldAttributes;
  return realmPlugin<FieldAttributes>({
    init(realm, params) {
      current = params!;
      realm.pub(createRootEditorSubscription$, (editor) =>
        editor.registerRootListener((root) => applyFieldAttributes(root, current))
      );
    },
    update(realm, params) {
      current = params!;
      applyFieldAttributes(realm.getValue(rootEditor$)?.getRootElement() ?? null, current);
    },
  });
}

// How edits are written back: "- " bullets, as in the API docs and examples.
const toMarkdownOptions = { bullet: "-" } as const;

// Only what Markdown can store, matching what the detail page renders.
const basePlugins = [
  headingsPlugin(),
  listsPlugin(),
  quotePlugin(),
  thematicBreakPlugin(),
  // No automatic linking: it rewrites bare URLs in stored text as soon as the
  // editor opens, without any edit. The detail page links bare URLs anyway.
  linkPlugin({ disableAutoLink: true }),
  linkDialogPlugin(),
  codeBlockPlugin({ defaultCodeBlockLanguage: "" }),
  codeMirrorPlugin({ codeBlockLanguages: { "": "Plain text" } }),
  markdownShortcutPlugin(),
  toolbarPlugin({
    toolbarContents: () => (
      <>
        <UndoRedo />
        <Separator />
        <BoldItalicUnderlineToggles options={["Bold", "Italic"]} />
        <CodeToggle />
        <Separator />
        <BlockTypeSelect />
        <ListsToggle options={["bullet", "number"]} />
        <Separator />
        <CreateLink />
        <InsertCodeBlock />
      </>
    ),
  }),
];

export default function MarkdownEditor({
  markdown,
  onChange,
  onParseError,
  onBlur,
  labelId,
  describedBy,
  invalid,
}: MarkdownEditorProps) {
  const [fieldAttributesPlugin] = useState(createFieldAttributesPlugin);

  return (
    <div className="boron-editor-field" aria-invalid={invalid}>
      <MDXEditor
        className="boron-editor"
        contentEditableClassName="markdown boron-editor-content"
        markdown={markdown}
        plugins={[...basePlugins, fieldAttributesPlugin({ labelId, describedBy, invalid })]}
        // The editor tidies the starting Markdown (bullet symbols, spacing).
        // Only the user's own edits count, so an untouched description is
        // saved exactly as it was stored.
        onChange={(value, initialMarkdownNormalize) => {
          if (!initialMarkdownNormalize) onChange(value);
        }}
        onError={onParseError}
        // HTML is shown as literal text on the detail page; here it opens the
        // plain Markdown fallback, so nothing is hidden from the person editing.
        suppressHtmlProcessing
        toMarkdownOptions={toMarkdownOptions}
        onBlur={onBlur}
      />
    </div>
  );
}
