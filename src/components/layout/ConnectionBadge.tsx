import { Activity, AlertCircle, Loader2 } from "lucide-react";
import { useNodeStatus } from "@/hooks/useStatus";
import { useAuthStore } from "@/store/authStore";
import { shortenId } from "@/lib/format";
import { Badge } from "@/components/primitives/Badge";

export function ConnectionBadge() {
  const host = useAuthStore((s) => s.host);
  const { data, isLoading, isError } = useNodeStatus();

  if (isLoading) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-subtle">
        <Loader2 className="h-3 w-3 animate-spin" />
        Connecting…
      </span>
    );
  }
  if (isError) {
    return (
      <Badge tone="danger" className="gap-1.5">
        <AlertCircle className="h-3 w-3" />
        Disconnected
      </Badge>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 text-xs">
      <Badge tone="success" className="gap-1.5">
        <Activity className="h-3 w-3" />
        {data?.online ? "Online" : "Reachable"}
      </Badge>
      <span className="text-subtle font-mono">
        {data?.address ? shortenId(data.address, 5, 3) : "—"}
      </span>
      <span className="text-subtle">·</span>
      <span className="text-subtle truncate max-w-[180px]" title={host}>
        {host || "no host"}
      </span>
    </span>
  );
}
