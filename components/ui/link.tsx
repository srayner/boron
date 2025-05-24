import NextLink from "next/link";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<typeof NextLink>;

export function Link({ className, ...props }: Props) {
  return (
    <NextLink
      {...props}
      className={cn("text-primary hover:underline", className)}
    />
  );
}
