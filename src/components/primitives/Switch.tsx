import * as RSwitch from "@radix-ui/react-switch";
import { cn } from "@/lib/cn";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  id,
  className,
  ...rest
}: SwitchProps) {
  return (
    <RSwitch.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full border border-border transition-colors",
        "bg-muted data-[state=checked]:bg-accent",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
        className,
      )}
      {...rest}
    >
      <RSwitch.Thumb
        className={cn(
          "block h-4 w-4 rounded-full bg-panel shadow-soft transition-transform",
          "translate-x-0.5 data-[state=checked]:translate-x-[18px]",
        )}
      />
    </RSwitch.Root>
  );
}
