import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  monospace?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, monospace, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-9 w-full rounded-md border bg-panel px-3 text-sm",
        "placeholder:text-subtle",
        "border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        monospace && "font-mono",
        invalid && "border-danger focus-visible:ring-danger/30",
        className,
      )}
      {...rest}
    />
  );
});
