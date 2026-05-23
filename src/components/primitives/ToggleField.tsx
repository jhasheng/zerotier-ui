import type { ReactNode } from "react";
import { Switch } from "./Switch";
import { cn } from "@/lib/cn";

export interface ToggleFieldProps {
  label: ReactNode;
  description?: ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  // Visual variant.
  // - "plain" (default): label/description with right-side switch, no border.
  // - "card": wraps the row in a bordered card (used in drawers / form grids).
  variant?: "plain" | "card";
  className?: string;
}

export function ToggleField({
  label,
  description,
  checked,
  onChange,
  disabled,
  variant = "plain",
  className,
}: ToggleFieldProps) {
  return (
    <label
      className={cn(
        "flex items-start justify-between gap-3 cursor-pointer select-none",
        variant === "card" && "rounded-lg border border-border p-3",
        disabled && "opacity-60 cursor-not-allowed",
        className,
      )}
    >
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {description ? (
          <div className="text-xs text-subtle mt-0.5">{description}</div>
        ) : null}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </label>
  );
}
