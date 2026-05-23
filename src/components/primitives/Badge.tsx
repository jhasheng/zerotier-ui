import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone =
  | "neutral"
  | "accent"
  | "success"
  | "danger"
  | "warn"
  | "outline"
  | "muted";

const tones: Record<Tone, string> = {
  neutral: "bg-fg/10 text-fg",
  accent: "bg-accent/15 text-accent",
  success: "bg-success/15 text-success",
  danger: "bg-danger/15 text-danger",
  warn: "bg-warn/20 text-warn",
  outline: "border border-border text-fg",
  muted: "bg-muted text-subtle",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
