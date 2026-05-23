import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface KVProps {
  label: ReactNode;
  children: ReactNode;
  mono?: boolean;
  divider?: boolean;
  className?: string;
}

// A single "label · value" row used inside info cards, drawers, and asides.
export function KV({
  label,
  children,
  mono,
  divider = true,
  className,
}: KVProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3",
        divider && "border-b border-border/60 pb-2 last:border-0 last:pb-0",
        className,
      )}
    >
      <span className="text-subtle">{label}</span>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 min-w-0",
          mono && "font-mono break-all text-right",
        )}
      >
        {children}
      </span>
    </div>
  );
}

export interface KVListProps {
  rows: { label: ReactNode; value: ReactNode; mono?: boolean }[];
  className?: string;
}

export function KVList({ rows, className }: KVListProps) {
  return (
    <div className={cn("space-y-2 text-xs", className)}>
      {rows.map((r, i) => (
        <KV key={i} label={r.label} mono={r.mono}>
          {r.value}
        </KV>
      ))}
    </div>
  );
}
