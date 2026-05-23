import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface FilterPillProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

export function FilterPill({ active, onClick, children }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-7 px-3 rounded-full border text-xs font-medium transition-colors",
        active
          ? "bg-accent/15 text-accent border-accent/30"
          : "border-border bg-panel text-subtle hover:bg-muted hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

export interface FilterPillGroupProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode }[];
  className?: string;
}

export function FilterPillGroup<T extends string>({
  value,
  onChange,
  options,
  className,
}: FilterPillGroupProps<T>) {
  return (
    <div className={cn("flex items-center gap-2", className)} role="tablist">
      {options.map((o) => (
        <FilterPill
          key={o.value}
          active={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </FilterPill>
      ))}
    </div>
  );
}
