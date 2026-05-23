import { Link } from "react-router-dom";
import {
  Activity,
  CircleDashed,
  Database,
  Globe,
  Network as NetIcon,
  Server,
  Tag,
} from "lucide-react";
import { useControllerStatus, useNodeStatus } from "@/hooks/useStatus";
import { useNetworkIds, useNetworksDetails } from "@/hooks/useNetworks";
import { Card, CardBody, CardHeader } from "@/components/primitives/Card";
import { Badge } from "@/components/primitives/Badge";
import { CopyButton } from "@/components/primitives/CopyButton";
import { StatCard } from "@/components/primitives/StatCard";
import { Spinner } from "@/components/primitives/Spinner";
import { formatRelativeTime } from "@/lib/format";

export default function DashboardPage() {
  const node = useNodeStatus();
  const ctl = useControllerStatus();
  const ids = useNetworkIds();
  const details = useNetworksDetails(ids.data);

  const totalNetworks = ids.data?.length ?? 0;
  const privateCount =
    details.data?.filter((n) => n.private !== false).length ?? 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-subtle mt-0.5">
          Status of this controller node and its managed networks.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={<Server className="h-4 w-4" />}
          label="Node address"
          value={
            node.data?.address ? (
              <span className="flex items-center gap-1.5">
                <code className="font-mono">{node.data.address}</code>
                <CopyButton value={node.data.address} />
              </span>
            ) : (
              <span className="text-subtle">—</span>
            )
          }
          hint={node.data?.version ? `ZT ${node.data.version}` : undefined}
          loading={node.isLoading}
        />
        <StatCard
          icon={<Activity className="h-4 w-4" />}
          label="Online"
          value={
            <Badge tone={node.data?.online ? "success" : "warn"}>
              {node.data?.online ? "Yes" : "No"}
            </Badge>
          }
          hint={
            node.data?.tcpFallbackActive
              ? "TCP fallback active"
              : "UDP path active"
          }
          loading={node.isLoading}
        />
        <StatCard
          icon={<Database className="h-4 w-4" />}
          label="Controller DB"
          value={
            <Badge tone={ctl.data?.databaseReady ? "success" : "danger"}>
              {ctl.data?.databaseReady ? "Ready" : "Not ready"}
            </Badge>
          }
          hint={
            ctl.data?.apiVersion != null
              ? `API v${ctl.data.apiVersion}`
              : undefined
          }
          loading={ctl.isLoading}
        />
        <StatCard
          icon={<NetIcon className="h-4 w-4" />}
          label="Networks"
          value={<span className="text-2xl font-semibold">{totalNetworks}</span>}
          hint={`${privateCount} private`}
          loading={ids.isLoading}
        />
      </div>

      <Card>
        <CardHeader
          title="Recent networks"
          description="The first 6 networks managed by this controller."
          action={
            <Link
              to="/networks"
              className="text-xs text-accent hover:underline"
            >
              View all →
            </Link>
          }
        />
        <CardBody className="p-0">
          {ids.isLoading ? (
            <div className="p-5">
              <Spinner />
            </div>
          ) : totalNetworks === 0 ? (
            <div className="p-8 text-center text-sm text-subtle">
              <CircleDashed className="h-6 w-6 mx-auto mb-2 opacity-60" />
              No networks yet. Head to{" "}
              <Link to="/networks" className="text-accent underline">
                Networks
              </Link>{" "}
              to create one.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {(details.data ?? []).slice(0, 6).map((n) => (
                <li key={n.id} className="px-5 py-3">
                  <Link
                    to={`/networks/${n.id}/settings`}
                    className="flex items-center justify-between gap-3 hover:underline"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Globe className="h-4 w-4 text-subtle shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">
                          {n.name || <span className="text-subtle">(unnamed)</span>}
                        </div>
                        <div className="text-xs text-subtle font-mono">{n.id}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {n.private === false ? (
                        <Badge tone="warn">Public</Badge>
                      ) : (
                        <Badge tone="muted">Private</Badge>
                      )}
                      <Badge tone="outline" className="gap-1">
                        <Tag className="h-3 w-3" />
                        {(n.tags?.length ?? 0)} tags
                      </Badge>
                      <span className="text-xs text-subtle">
                        {formatRelativeTime(n.creationTime)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

