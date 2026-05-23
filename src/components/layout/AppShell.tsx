import type { ReactNode } from "react";
import { TooltipRoot } from "@/components/primitives/Tooltip";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <TooltipRoot>
      <div className="flex h-full">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-7xl w-full px-4 md:px-6 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipRoot>
  );
}
