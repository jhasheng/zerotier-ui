import * as RSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
  group?: string;
}

export interface SelectProps {
  value: string;
  onValueChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  id?: string;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  triggerClassName,
  id,
}: SelectProps) {
  const groups = groupOptions(options);
  return (
    <RSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <RSelect.Trigger
        id={id}
        className={cn(
          "inline-flex h-9 w-full items-center justify-between gap-2 rounded-md border border-border bg-panel px-3 text-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          triggerClassName,
        )}
      >
        <RSelect.Value placeholder={placeholder} />
        <RSelect.Icon>
          <ChevronDown className="h-4 w-4 opacity-60" />
        </RSelect.Icon>
      </RSelect.Trigger>
      <RSelect.Portal>
        <RSelect.Content
          position="popper"
          sideOffset={4}
          className={cn(
            "z-50 max-h-[60vh] min-w-[var(--radix-select-trigger-width)] overflow-hidden",
            "rounded-md border border-border bg-panel shadow-pop animate-fadeIn",
          )}
        >
          <RSelect.Viewport className="p-1">
            {groups.map((g, gi) => (
              <RSelect.Group key={g.name ?? `g${gi}`}>
                {g.name ? (
                  <RSelect.Label className="px-2 py-1 text-xs uppercase tracking-wide text-subtle">
                    {g.name}
                  </RSelect.Label>
                ) : null}
                {g.items.map((opt) => (
                  <RSelect.Item
                    key={opt.value}
                    value={opt.value}
                    className={cn(
                      "relative flex h-8 items-center rounded-md pl-7 pr-3 text-sm",
                      "cursor-default select-none outline-none",
                      "data-[highlighted]:bg-muted data-[state=checked]:font-medium",
                    )}
                  >
                    <RSelect.ItemIndicator className="absolute left-2">
                      <Check className="h-3.5 w-3.5" />
                    </RSelect.ItemIndicator>
                    <RSelect.ItemText>{opt.label}</RSelect.ItemText>
                  </RSelect.Item>
                ))}
              </RSelect.Group>
            ))}
          </RSelect.Viewport>
        </RSelect.Content>
      </RSelect.Portal>
    </RSelect.Root>
  );
}

function groupOptions(opts: SelectOption[]) {
  const map = new Map<string | undefined, SelectOption[]>();
  for (const o of opts) {
    const key = o.group;
    const arr = map.get(key);
    if (arr) arr.push(o);
    else map.set(key, [o]);
  }
  return Array.from(map.entries()).map(([name, items]) => ({ name, items }));
}
