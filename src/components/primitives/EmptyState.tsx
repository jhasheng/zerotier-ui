import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-6 gap-3",
        "rounded-xl border border-dashed border-border/60 bg-muted/20",
        className,
      )}
    >
      {icon ? <div className="text-subtle">{icon}</div> : null}
      <div className="text-sm font-medium">{title}</div>
      {description ? (
        <div className="text-xs text-subtle max-w-md">{description}</div>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
