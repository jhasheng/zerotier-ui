import { Outlet, useLocation, useParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useNetwork } from "@/hooks/useNetworks";
import { NavTabs } from "@/components/primitives/Tabs";
import { Badge } from "@/components/primitives/Badge";
import { CopyButton } from "@/components/primitives/CopyButton";
import { Spinner } from "@/components/primitives/Spinner";
import { EmptyState } from "@/components/primitives/EmptyState";
import { NetworkAside } from "@/components/network/NetworkAside";

export default function NetworkDetailPage() {
  const { nwid } = useParams();
  const q = useNetwork(nwid);

  if (q.isLoading) {
    return (
      <div className="py-10">
        <Spinner />
      </div>
    );
  }
  if (q.isError || !q.data) {
    return (
      <EmptyState
        title="Network not found"
        description={`No network with id ${nwid}.`}
        action={
          <Link to="/networks" className="text-accent underline text-sm">
            Back to networks
          </Link>
        }
      />
    );
  }

  const net = q.data;
  const base = `/networks/${nwid}`;
  const location = useLocation();
  const showAside = !location.pathname.endsWith("/danger");

  return (
    <div className="space-y-5">
      <Link
        to="/networks"
        className="text-xs text-subtle hover:text-fg inline-flex items-center gap-1"
      >
        <ChevronLeft className="h-3 w-3" />
        Networks
      </Link>
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {net.name || (
              <span className="italic text-subtle">(unnamed)</span>
            )}
          </h1>
          {net.private === false ? (
            <Badge tone="warn">Public</Badge>
          ) : (
            <Badge tone="muted">Private</Badge>
          )}
        </div>
        <div className="text-xs text-subtle inline-flex items-center gap-1.5">
          <code className="font-mono">{net.id}</code>
          <CopyButton value={net.id} />
        </div>
      </header>
      <NavTabs
        items={[
          { to: `${base}/overview`, label: "Overview" },
          { to: `${base}/members`, label: "Members" },
          { to: `${base}/client-config`, label: "Client Config" },
          { to: `${base}/traffic-policy`, label: "Traffic Policy" },
          { to: `${base}/danger`, label: "Danger" },
        ]}
      />
      {showAside ? (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
          <div className="min-w-0">
            <Outlet />
          </div>
          <NetworkAside net={net} />
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  );
}
