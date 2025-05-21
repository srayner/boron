"use client";

import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { FieldValues, ControllerRenderProps, Path } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

interface DatePickerFieldProps<T extends FieldValues> {
  field: ControllerRenderProps<T, Path<T>>;
  label: string;
  description?: string;
}

export function DatePickerField<T extends FieldValues>({
  field,
  label,
  description,
}: DatePickerFieldProps<T>) {
  const [open, setOpen] = useState(false);

  function handleSelect(date: Date | undefined) {
    field.onChange(date);
    setOpen(false);
  }

  function clearDate(e: React.MouseEvent) {
    e.stopPropagation();
    field.onChange(null);
    setOpen(false);
  }

  return (
    <FormItem className="flex flex-col">
      <FormLabel className="pointer-events-none">{label}</FormLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] pl-3 text-left font-normal flex items-center justify-between",
                !field.value && "text-muted-foreground"
              )}
            >
              <span>
                {field.value ? (
                  format(field.value, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </span>
              <span className="flex items-center gap-2">
                {field.value && (
                  <button
                    type="button"
                    onClick={clearDate}
                    aria-label="Clear date"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
                <CalendarIcon className="h-4 w-4 opacity-50" />
              </span>
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={field.value}
            onSelect={handleSelect}
            disabled={(date) => date < new Date("1900-01-01")}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
}
