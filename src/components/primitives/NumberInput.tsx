import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface NumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  invalid?: boolean;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput({ value, onChange, className, invalid, ...rest }, ref) {
    return (
      <input
        ref={ref}
        type="number"
        inputMode="numeric"
        value={value == null || Number.isNaN(value) ? "" : String(value)}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") return onChange(null);
          const n = Number(raw);
          onChange(Number.isFinite(n) ? n : null);
        }}
        className={cn(
          "h-9 w-full rounded-md border bg-panel px-3 text-sm tabular-nums",
          "border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent",
          invalid && "border-danger focus-visible:ring-danger/30",
          className,
        )}
        {...rest}
      />
    );
  },
);
