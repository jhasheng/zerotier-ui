import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/cn";
import { Tooltip } from "./Tooltip";

export function CopyButton({
  value,
  label = "Copy",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  return (
    <Tooltip content={copied ? "Copied" : label}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex h-6 w-6 items-center justify-center rounded text-subtle hover:text-fg hover:bg-muted",
          className,
        )}
        aria-label={label}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-success" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </Tooltip>
  );
}
