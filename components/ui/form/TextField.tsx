import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form";

type TextFieldProps<TFieldValues extends FieldValues> = {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  label: string;
  placeholder?: string;
  className?: string;
};

export function TextField<TFieldValues extends FieldValues>({
  field,
  label,
  placeholder,
  className,
}: TextFieldProps<TFieldValues>) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Input {...field} placeholder={placeholder} className={className} />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
