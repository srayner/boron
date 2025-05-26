"use client";

import { useState, useRef } from "react";
import { X } from "lucide-react";
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type TagFieldProps<TFieldValues extends FieldValues> = {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  label: string;
  placeholder?: string;
  className?: string;
};

export function TagField<TFieldValues extends FieldValues>({
  field,
  label,
  placeholder,
  className,
}: TagFieldProps<TFieldValues>) {
  const [tags, setTags] = useState<string[]>(() =>
    field.value
      ? field.value
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean)
      : []
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const updateField = (newTags: string[]) => {
    setTags(newTags);
    field.onChange(newTags.join(","));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget.value.trim();

    if ((e.key === "Enter" || e.key === ",") && input) {
      e.preventDefault();
      if (!tags.includes(input)) {
        updateField([...tags, input]);
      }
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const input = e.currentTarget.value.trim();
    if (input && !tags.includes(input)) {
      updateField([...tags, input]);
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeTag = (tag: string) => {
    updateField(tags.filter((t) => t !== tag));
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div
          className={`flex flex-wrap items-center gap-1 border rounded-md px-2 py-1 focus-within:ring-2 focus-within:ring-ring ${className}`}
        >
          {tags.map((tag) => (
            <div
              key={tag}
              className="flex items-center gap-1 bg-muted px-2 pt-0.5 pb-1 rounded-full text-sm"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <input
            ref={inputRef}
            type="text"
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="flex-grow bg-transparent outline-none p-1 text-sm"
            placeholder={placeholder}
          />
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
