import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TabLinkItem {
  to: string;
  label: ReactNode;
  end?: boolean;
}

export function NavTabs({ items }: { items: TabLinkItem[] }) {
  return (
    <nav className="flex items-center gap-1 border-b border-border overflow-x-auto">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.end}
          className={({ isActive }) =>
            cn(
              "relative px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              "text-subtle hover:text-fg",
              isActive &&
                "text-fg after:absolute after:left-2 after:right-2 after:bottom-[-1px] after:h-[2px] after:bg-accent after:rounded-full",
            )
          }
        >
          {it.label}
        </NavLink>
      ))}
    </nav>
  );
}
