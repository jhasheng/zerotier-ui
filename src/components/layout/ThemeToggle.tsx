import * as RDropdown from "@radix-ui/react-dropdown-menu";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { useThemeStore, type ThemePref } from "@/store/themeStore";
import { cn } from "@/lib/cn";

const OPTIONS: { value: ThemePref; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  // Trigger icon mirrors the current preference (not the resolved appearance) —
  // a "System" picker should keep showing the monitor icon even while resolved dark.
  const Active = OPTIONS.find((o) => o.value === theme)?.Icon ?? Monitor;

  return (
    <RDropdown.Root>
      <RDropdown.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Theme: ${theme}`}
          title={`Theme: ${theme}`}
        >
          <Active className="h-4 w-4" />
        </Button>
      </RDropdown.Trigger>
      <RDropdown.Portal>
        <RDropdown.Content
          align="end"
          sideOffset={4}
          className="z-50 min-w-[160px] rounded-md border border-border bg-panel p-1 shadow-pop animate-fadeIn"
        >
          <RDropdown.RadioGroup
            value={theme}
            onValueChange={(v) => setTheme(v as ThemePref)}
          >
            {OPTIONS.map(({ value, label, Icon }) => (
              <RDropdown.RadioItem
                key={value}
                value={value}
                className={cn(
                  "flex items-center gap-2 px-2 h-8 text-sm rounded-md cursor-default select-none outline-none",
                  "data-[highlighted]:bg-muted",
                )}
              >
                <Icon className="h-4 w-4 text-subtle" />
                <span className="flex-1">{label}</span>
                <RDropdown.ItemIndicator>
                  <Check className="h-4 w-4 text-accent" />
                </RDropdown.ItemIndicator>
              </RDropdown.RadioItem>
            ))}
          </RDropdown.RadioGroup>
        </RDropdown.Content>
      </RDropdown.Portal>
    </RDropdown.Root>
  );
}
