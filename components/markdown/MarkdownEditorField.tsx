"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form";
import {
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  DESCRIPTION_COUNT_FROM,
  DESCRIPTION_MAX_LENGTH,
} from "@/lib/validation/description";

// MDXEditor only works in the browser.
const MarkdownEditor = dynamic(() => import("./MarkdownEditor"), {
  ssr: false,
  loading: () => <div className="boron-editor-field min-h-40" aria-hidden="true" />,
});

type MarkdownEditorFieldProps<TFieldValues extends FieldValues> = {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  label: string;
  description?: string;
};

export function MarkdownEditorField<TFieldValues extends FieldValues>(
  props: MarkdownEditorFieldProps<TFieldValues>
) {
  // The field's ids come from FormItem, so the contents render inside it.
  return (
    <FormItem>
      <MarkdownEditorFieldContents {...props} />
    </FormItem>
  );
}

function MarkdownEditorFieldContents<TFieldValues extends FieldValues>({
  field,
  label,
  description,
}: MarkdownEditorFieldProps<TFieldValues>) {
  const { error } = useFormField();
  // Text the editor can't show is edited as plain Markdown instead, so
  // nothing in it is lost when the form is saved.
  const [rawMode, setRawMode] = useState(false);

  // The editor's label and descriptions are linked from JavaScript after it
  // loads, so their ids must match the server-rendered page. Ids from useId
  // can differ between server and browser, so these come from the field name,
  // which is unique within a form and the same in both.
  const ids = {
    label: `${field.name}-label`,
    input: `${field.name}-input`,
    raw: `${field.name}-raw-note`,
    description: `${field.name}-description`,
    message: `${field.name}-message`,
    count: `${field.name}-count`,
  };

  const value: string = field.value ?? "";
  const describedBy = [description && ids.description, error && ids.message, value.length >= DESCRIPTION_COUNT_FROM && ids.count]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <FormLabel id={ids.label} htmlFor={rawMode ? ids.input : undefined}>
        {label}
      </FormLabel>
      {rawMode ? (
        <>
          <Textarea
            id={ids.input}
            aria-describedby={`${ids.raw} ${describedBy}`}
            aria-invalid={!!error}
            className="min-h-40 font-mono"
            {...field}
            value={value}
          />
          <p id={ids.raw} className="text-muted-foreground text-sm">
            This description has formatting the editor can&apos;t show, so it&apos;s shown as Markdown. Your text is kept exactly as it is.
          </p>
        </>
      ) : (
        <MarkdownEditor
          markdown={value}
          onChange={field.onChange}
          onParseError={() => setRawMode(true)}
          onBlur={field.onBlur}
          labelId={ids.label}
          describedBy={describedBy}
          invalid={!!error}
        />
      )}
      {description && <FormDescription id={ids.description}>{description}</FormDescription>}
      {value.length >= DESCRIPTION_COUNT_FROM && (
        <p
          id={ids.count}
          aria-live="polite"
          className={value.length > DESCRIPTION_MAX_LENGTH ? "text-destructive text-sm" : "text-muted-foreground text-sm"}
        >
          {value.length.toLocaleString("en-GB")} / {DESCRIPTION_MAX_LENGTH.toLocaleString("en-GB")} characters
        </p>
      )}
      <FormMessage id={ids.message} />
    </>
  );
}
