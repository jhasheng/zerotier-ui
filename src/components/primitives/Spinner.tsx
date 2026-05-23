import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />;
}

export function FullPageSpinner({ label }: { label?: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-subtle">
      <Loader2 className="h-6 w-6 animate-spin" />
      {label ? <span className="text-sm">{label}</span> : null}
    </div>
  );
}
