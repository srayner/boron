import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form";

type TextAreaFieldProps<TFieldValues extends FieldValues> = {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  label: string;
  description?: string;
  className?: string;
};

export function TextAreaField<TFieldValues extends FieldValues>({
  field,
  label,
  description,
  className,
}: TextAreaFieldProps<TFieldValues>) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Textarea className={className} {...field} value={field.value ?? ""} />
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
}
