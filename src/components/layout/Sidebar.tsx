import { NavLink } from "react-router-dom";
import { Gauge, Globe2, Network as NetIcon } from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  { to: "/", end: true, label: "Dashboard", Icon: Gauge },
  { to: "/networks", label: "Networks", Icon: NetIcon },
  { to: "/peers", label: "Peers", Icon: Globe2 },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-panel/40">
      <div className="px-4 py-4 flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-accent text-accent-fg grid place-items-center font-bold">
          Z
        </div>
        <div>
          <div className="text-sm font-semibold leading-none">ZT Controller</div>
          <div className="text-[10px] text-subtle leading-none mt-1">
            UI v0.1
          </div>
        </div>
      </div>
      <nav className="px-2 flex-1 flex flex-col gap-0.5">
        {items.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                "text-subtle hover:bg-muted hover:text-fg",
                isActive && "bg-muted text-fg font-medium",
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
