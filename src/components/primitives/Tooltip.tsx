import * as RTooltip from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";

export function TooltipRoot({ children }: { children: ReactNode }) {
  return (
    <RTooltip.Provider delayDuration={200} skipDelayDuration={300}>
      {children}
    </RTooltip.Provider>
  );
}

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}

export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  return (
    <RTooltip.Root>
      <RTooltip.Trigger asChild>{children}</RTooltip.Trigger>
      <RTooltip.Portal>
        <RTooltip.Content
          side={side}
          sideOffset={6}
          className="z-50 rounded-md bg-fg text-bg px-2 py-1 text-xs shadow-pop animate-fadeIn"
        >
          {content}
          <RTooltip.Arrow className="fill-fg" />
        </RTooltip.Content>
      </RTooltip.Portal>
    </RTooltip.Root>
  );
}
