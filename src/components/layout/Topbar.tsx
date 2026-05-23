import { useNavigate } from "react-router-dom";
import { LogOut, RotateCw, ShieldAlert } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/primitives/Button";
import { Dropdown } from "@/components/primitives/DropdownMenu";
import { ConnectionBadge } from "./ConnectionBadge";

export function Topbar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clear = useAuthStore((s) => s.clear);

  const onDisconnect = () => {
    clear();
    queryClient.clear();
    navigate("/connect", { replace: true });
  };

  return (
    <header className="h-14 shrink-0 border-b border-border bg-panel/60 backdrop-blur sticky top-0 z-30">
      <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <ConnectionBadge />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => queryClient.invalidateQueries()}
            aria-label="Refresh data"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Dropdown
            trigger={
              <Button variant="outline" size="sm">
                Connection
              </Button>
            }
            groups={[
              {
                items: [
                  {
                    label: "Change host / token",
                    onSelect: () => navigate("/connect"),
                  },
                  {
                    label: "Token is stored in browser only",
                    onSelect: () => {},
                    disabled: true,
                    icon: <ShieldAlert className="h-4 w-4" />,
                  },
                ],
              },
              {
                items: [
                  {
                    label: "Disconnect",
                    onSelect: onDisconnect,
                    danger: true,
                    icon: <LogOut className="h-4 w-4" />,
                  },
                ],
              },
            ]}
          />
        </div>
      </div>
    </header>
  );
}
