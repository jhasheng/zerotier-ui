import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Table({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-border", className)}>
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-muted/40 text-subtle text-[11px] font-medium">
      {children}
    </thead>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function TR({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        onClick && "cursor-pointer hover:bg-muted/40",
        "transition-colors",
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function TH({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "text-left font-medium px-3 py-2 whitespace-nowrap",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TD({
  children,
  className,
  mono,
  num,
  onClick,
  colSpan,
}: {
  children: ReactNode;
  className?: string;
  mono?: boolean;
  num?: boolean;
  onClick?: (e: React.MouseEvent<HTMLTableCellElement>) => void;
  colSpan?: number;
}) {
  return (
    <td
      onClick={onClick}
      colSpan={colSpan}
      className={cn(
        "px-3 py-2 align-middle",
        mono && "font-mono text-xs",
        num && "tabular-nums text-right",
        className,
      )}
    >
      {children}
    </td>
  );
}
