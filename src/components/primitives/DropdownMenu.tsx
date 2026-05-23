import * as RDropdown from "@radix-ui/react-dropdown-menu";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface DropdownMenuItem {
  label: ReactNode;
  onSelect: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
}

export interface DropdownMenuGroupDef {
  label?: string;
  items: DropdownMenuItem[];
}

export interface DropdownProps {
  trigger: ReactNode;
  groups: DropdownMenuGroupDef[];
  align?: "start" | "center" | "end";
}

export function Dropdown({ trigger, groups, align = "end" }: DropdownProps) {
  return (
    <RDropdown.Root>
      <RDropdown.Trigger asChild>{trigger}</RDropdown.Trigger>
      <RDropdown.Portal>
        <RDropdown.Content
          align={align}
          sideOffset={4}
          className={cn(
            "z-50 min-w-[180px] rounded-md border border-border bg-panel p-1 shadow-pop animate-fadeIn",
          )}
        >
          {groups.map((g, gi) => (
            <RDropdown.Group key={gi}>
              {g.label ? (
                <RDropdown.Label className="px-2 py-1 text-xs uppercase tracking-wide text-subtle">
                  {g.label}
                </RDropdown.Label>
              ) : null}
              {g.items.map((it, ii) => (
                <RDropdown.Item
                  key={ii}
                  disabled={it.disabled}
                  onSelect={(e) => {
                    e.preventDefault();
                    it.onSelect();
                  }}
                  className={cn(
                    "flex items-center gap-2 px-2 h-8 text-sm rounded-md cursor-default select-none outline-none",
                    "data-[highlighted]:bg-muted",
                    "data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
                    it.danger && "text-danger data-[highlighted]:bg-danger/10",
                  )}
                >
                  {it.icon}
                  <span className="flex-1">{it.label}</span>
                </RDropdown.Item>
              ))}
              {gi < groups.length - 1 ? (
                <RDropdown.Separator className="my-1 h-px bg-border" />
              ) : null}
            </RDropdown.Group>
          ))}
        </RDropdown.Content>
      </RDropdown.Portal>
    </RDropdown.Root>
  );
}
