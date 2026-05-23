import {
  Activity,
  GitBranch,
  Globe,
  ShieldCheck,
  Tag as TagIcon,
  Users,
} from "lucide-react";
import {
  Card,
  CardBody,
  CardHeader,
} from "@/components/primitives/Card";
import { Badge } from "@/components/primitives/Badge";
import { CopyButton } from "@/components/primitives/CopyButton";
import { KV } from "@/components/primitives/KV";
import { formatAbsoluteTime, formatRelativeTime } from "@/lib/format";
import { useMembersDetailed } from "@/hooks/useMembers";
import type { Network } from "@/api/types";

export function NetworkAside({ net }: { net: Network }) {
  const members = useMembersDetailed(net.id);
  const total = members.data?.length ?? 0;
  const authorized = (members.data ?? []).filter((m) => m.authorized).length;

  const memberSummary = members.isLoading
    ? "…"
    : `${authorized}/${total} authorized`;

  return (
    <aside className="space-y-4">
      <Card>
        <CardHeader title="About this network" />
        <CardBody className="space-y-3 text-xs">
          <KV label="NWID">
            <span className="font-mono break-all">{net.id}</span>
            <CopyButton value={net.id} />
          </KV>
          <KV label="Name">
            <span className="text-right">
              {net.name || <span className="italic text-subtle">unnamed</span>}
            </span>
          </KV>
          <KV label="Visibility">
            {net.private === false ? (
              <Badge tone="warn">Public</Badge>
            ) : (
              <Badge tone="muted">Private</Badge>
            )}
          </KV>
          <KV label="Created">
            <span title={formatAbsoluteTime(net.creationTime)}>
              {formatRelativeTime(net.creationTime)}
            </span>
          </KV>
          <KV label="Revision">
            <span className="font-mono tabular-nums">
              {net.revision ?? "—"}
            </span>
          </KV>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Summary" />
        <CardBody className="space-y-3 text-xs">
          <SummaryRow
            icon={<Users className="h-3.5 w-3.5" />}
            label="Members"
            value={memberSummary}
          />
          <SummaryRow
            icon={<Globe className="h-3.5 w-3.5" />}
            label="IP pools"
            value={String(net.ipAssignmentPools?.length ?? 0)}
          />
          <SummaryRow
            icon={<Activity className="h-3.5 w-3.5" />}
            label="Routes"
            value={String(net.routes?.length ?? 0)}
          />
          <SummaryRow
            icon={<GitBranch className="h-3.5 w-3.5" />}
            label="Rules"
            value={String(net.rules?.length ?? 0)}
          />
          <SummaryRow
            icon={<ShieldCheck className="h-3.5 w-3.5" />}
            label="Capabilities"
            value={String(net.capabilities?.length ?? 0)}
          />
          <SummaryRow
            icon={<TagIcon className="h-3.5 w-3.5" />}
            label="Tags"
            value={String(net.tags?.length ?? 0)}
          />
        </CardBody>
      </Card>
    </aside>
  );
}

interface SummaryRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function SummaryRow({ icon, label, value }: SummaryRowProps) {
  return (
    <KV
      divider={false}
      label={
        <span className="inline-flex items-center gap-2">
          {icon}
          {label}
        </span>
      }
    >
      <span className="font-mono tabular-nums">{value}</span>
    </KV>
  );
}
