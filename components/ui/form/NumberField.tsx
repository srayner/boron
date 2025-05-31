import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form";

type NumberFieldProps<TFieldValues extends FieldValues> = {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  label: string;
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
};

export function NumberField<TFieldValues extends FieldValues>({
  field,
  label,
  placeholder,
  className,
  min,
  max,
  step,
}: NumberFieldProps<TFieldValues>) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Input
          {...field}
          type="number"
          placeholder={placeholder}
          className={className}
          min={min}
          max={max}
          step={step}
          value={field.value ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            field.onChange(value === "" ? undefined : +value);
          }}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
