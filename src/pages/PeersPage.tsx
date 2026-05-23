import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Globe2,
  Wifi,
} from "lucide-react";
import { usePeers } from "@/hooks/usePeers";
import { SearchInput } from "@/components/primitives/SearchInput";
import { Badge } from "@/components/primitives/Badge";
import { CopyButton } from "@/components/primitives/CopyButton";
import { EmptyState } from "@/components/primitives/EmptyState";
import { Spinner } from "@/components/primitives/Spinner";
import {
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/primitives/Table";
import { cn } from "@/lib/cn";
import { formatRelativeTime } from "@/lib/format";
import type { Peer, PeerPath } from "@/api/types";

export default function PeersPage() {
  const peers = usePeers();
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const list = peers.data ?? [];
    const term = q.trim().toLowerCase();
    const filtered = !term
      ? list
      : list.filter(
          (p) =>
            p.address.toLowerCase().includes(term) ||
            (p.version ?? "").toLowerCase().includes(term) ||
            (p.role ?? "").toLowerCase().includes(term),
        );
    return filtered.slice().sort((a, b) => {
      const ra = roleRank(a.role);
      const rb = roleRank(b.role);
      if (ra !== rb) return ra - rb;
      return (a.latency ?? 9999) - (b.latency ?? 9999);
    });
  }, [peers.data, q]);

  const summary = useMemo(() => {
    const list = peers.data ?? [];
    return {
      total: list.length,
      leaves: list.filter((p) => p.role === "LEAF").length,
    };
  }, [peers.data]);

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Peers</h1>
          <p className="text-sm text-subtle mt-0.5">
            Live peering view from this node (<code>/peer</code>). Refreshes
            every 5s.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="muted" className="tabular-nums">
            {summary.total} peer{summary.total === 1 ? "" : "s"}
          </Badge>
          <Badge tone="muted" className="tabular-nums">
            {summary.leaves} leaf
          </Badge>
        </div>
      </header>

      <SearchInput
        containerClassName="max-w-sm"
        placeholder="Search by address, version, role…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {peers.isLoading ? (
        <div className="py-10">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Globe2 className="h-6 w-6" />}
          title="No peers"
          description="This node has no live peer sessions."
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH className="w-8" />
              <TH>Address</TH>
              <TH>Role</TH>
              <TH className="text-right">Latency</TH>
              <TH>Version</TH>
              <TH>Last seen</TH>
              <TH className="text-right">Paths</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((p) => (
              <PeerRow key={p.address} peer={p} />
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}

// Leaves first (your members) → moons → planet roots (infrastructure).
function roleRank(role: string | undefined): number {
  if (role === "LEAF") return 0;
  if (role === "MOON") return 1;
  if (role === "PLANET") return 2;
  return 3;
}

function lastReceive(paths: PeerPath[]): number | null {
  let m = 0;
  for (const p of paths) {
    if (typeof p.lastReceive === "number" && p.lastReceive > m) {
      m = p.lastReceive;
    }
  }
  return m > 0 ? m : null;
}

function latencyTone(ms: number | undefined): string {
  if (ms == null || ms < 0) return "text-subtle";
  if (ms < 50) return "text-success";
  if (ms < 200) return "text-fg";
  return "text-warn";
}

function PeerRow({ peer }: { peer: Peer }) {
  const [open, setOpen] = useState(false);
  const paths = peer.paths ?? [];
  const activePaths = paths.filter((p) => p.active && !p.expired).length;
  const lastSeen = lastReceive(paths);
  const isLeaf = peer.role === "LEAF";
  const hasVersion = peer.version && !peer.version.includes("-1");

  return (
    <>
      <TR
        onClick={() => setOpen((o) => !o)}
        className={cn("cursor-pointer", open && "bg-muted/30")}
      >
        <TD className="w-8">
          <span className="text-subtle inline-flex">
            {open ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </span>
        </TD>
        <TD mono>
          <span
            className="inline-flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {peer.address}
            <CopyButton value={peer.address} />
          </span>
        </TD>
        <TD>
          <Badge tone={isLeaf ? "accent" : "outline"}>
            {peer.role ?? "—"}
          </Badge>
        </TD>
        <TD num>
          {peer.latency == null || peer.latency < 0 ? (
            <span className="text-subtle">—</span>
          ) : (
            <span
              className={cn(
                "font-mono text-xs tabular-nums",
                latencyTone(peer.latency),
              )}
            >
              {peer.latency} ms
            </span>
          )}
        </TD>
        <TD>
          <span className="font-mono text-xs">
            {hasVersion ? peer.version : <span className="text-subtle">—</span>}
          </span>
        </TD>
        <TD>
          {lastSeen ? (
            <span className="text-xs tabular-nums">
              {formatRelativeTime(lastSeen)}
            </span>
          ) : (
            <span className="text-subtle text-xs">—</span>
          )}
        </TD>
        <TD className="text-right">
          <Badge
            tone={activePaths > 0 ? "success" : "muted"}
            className="gap-1 tabular-nums"
          >
            <Wifi className="h-3 w-3" />
            {activePaths}/{paths.length}
          </Badge>
        </TD>
      </TR>
      {open ? (
        <TR>
          <TD colSpan={7} className="bg-muted/30">
            <PathsTable paths={paths} />
          </TD>
        </TR>
      ) : null}
    </>
  );
}

function PathsTable({ paths }: { paths: PeerPath[] }) {
  if (paths.length === 0) {
    return <p className="text-xs text-subtle">No paths reported.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="text-subtle text-[10px] font-medium">
          <tr>
            <th className="text-left font-medium px-2 py-1.5">Endpoint</th>
            <th className="text-left font-medium px-2 py-1.5">State</th>
            <th className="text-left font-medium px-2 py-1.5">Last send</th>
            <th className="text-left font-medium px-2 py-1.5">Last receive</th>
            <th className="text-left font-medium px-2 py-1.5">Trusted path</th>
          </tr>
        </thead>
        <tbody>
          {paths.map((p, i) => (
            <tr key={i} className="border-t border-border/60">
              <td className="px-2 py-1.5 font-mono">{p.address}</td>
              <td className="px-2 py-1.5 space-x-1">
                {p.active && !p.expired ? (
                  <Badge tone="success">active</Badge>
                ) : p.expired ? (
                  <Badge tone="muted">expired</Badge>
                ) : (
                  <Badge tone="warn">idle</Badge>
                )}
                {p.preferred ? <Badge tone="outline">preferred</Badge> : null}
              </td>
              <td className="px-2 py-1.5 tabular-nums">
                {formatRelativeTime(p.lastSend)}
              </td>
              <td className="px-2 py-1.5 tabular-nums">
                {formatRelativeTime(p.lastReceive)}
              </td>
              <td className="px-2 py-1.5 font-mono">
                {p.trustedPathId ? p.trustedPathId : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
