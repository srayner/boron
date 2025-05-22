import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form";

type SelectItem = Record<string, unknown>;

type SelectFieldProps<TFieldValues extends FieldValues, TItem> = {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  label: string;
  items: TItem[];
  itemKey?: keyof TItem;
  itemLabel?: keyof TItem;
  placeholder?: string;
  className?: string;
};

export function SelectField<TFieldValues extends FieldValues, TItem>({
  field,
  label,
  items,
  itemKey = "id" as keyof TItem,
  itemLabel = "name" as keyof TItem,
  placeholder = "Select...",
  className = "w-[240px]",
}: SelectFieldProps<TFieldValues, TItem>) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Select value={field.value} onValueChange={field.onChange}>
          <SelectTrigger className={className}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem
                key={String(item[itemKey])}
                value={String(item[itemKey])}
              >
                {String(item[itemLabel])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
