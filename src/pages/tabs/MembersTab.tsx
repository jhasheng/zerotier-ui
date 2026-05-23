import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { UserCheck2, UserX2, Wifi } from "lucide-react";
import {
  useMembersDetailed,
  useUpsertMember,
} from "@/hooks/useMembers";
import {
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/primitives/Table";
import { Switch } from "@/components/primitives/Switch";
import { SearchInput } from "@/components/primitives/SearchInput";
import { FilterPillGroup } from "@/components/primitives/FilterPill";
import { Badge } from "@/components/primitives/Badge";
import { EmptyState } from "@/components/primitives/EmptyState";
import { Spinner } from "@/components/primitives/Spinner";
import { CopyButton } from "@/components/primitives/CopyButton";
import { MemberDrawer } from "@/pages/MemberDrawer";
import { useApiError } from "@/hooks/useApiError";
import { toast } from "@/store/uiStore";
import { shortenId } from "@/lib/format";
import { sortIpStrings } from "@/lib/format";

export default function MembersTab() {
  const { nwid, memberId } = useParams();
  const navigate = useNavigate();
  const list = useMembersDetailed(nwid);
  const upsert = useUpsertMember(nwid!);
  const onError = useApiError();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "authorized" | "pending">(
    "all",
  );

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const data = (list.data ?? []).filter((m) => {
      if (filter === "authorized" && !m.authorized) return false;
      if (filter === "pending" && m.authorized) return false;
      if (!term) return true;
      return (
        (m.address ?? m.id).toLowerCase().includes(term) ||
        (m.name ?? "").toLowerCase().includes(term) ||
        (m.ipAssignments ?? []).some((ip) => ip.includes(term))
      );
    });
    return data.sort((a, b) => {
      if ((a.authorized ?? false) !== (b.authorized ?? false)) {
        return a.authorized ? -1 : 1;
      }
      return (a.name ?? a.id).localeCompare(b.name ?? b.id);
    });
  }, [list.data, q, filter]);

  const totals = useMemo(() => {
    const data = list.data ?? [];
    return {
      total: data.length,
      authorized: data.filter((m) => m.authorized).length,
    };
  }, [list.data]);

  const toggle = async (id: string, current: boolean) => {
    try {
      await upsert.mutateAsync({ memberId: id, patch: { authorized: !current } });
      toast(
        current ? "warn" : "success",
        current ? "Member deauthorized" : "Member authorized",
      );
    } catch (err) {
      onError(err, "Failed to toggle authorization");
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge tone="muted">
            {totals.authorized}/{totals.total} authorized
          </Badge>
        </div>
        <FilterPillGroup
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "authorized", label: "Authorized" },
            { value: "pending", label: "Pending" },
          ]}
        />
      </header>

      <SearchInput
        containerClassName="max-w-sm"
        placeholder="Search by address, name, or IP…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {list.isLoading ? (
        <div className="py-10">
          <Spinner />
        </div>
      ) : (list.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={<Wifi className="h-6 w-6" />}
          title="No members yet"
          description={
            <>
              Run <code>zerotier-cli join {nwid}</code> on a client to make it
              show up here.
            </>
          }
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH className="w-12">Auth</TH>
              <TH>Member</TH>
              <TH>Address</TH>
              <TH>IPs</TH>
              <TH>Client</TH>
              <TH className="text-right">Open</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((m) => {
              const ips = (m.ipAssignments ?? []).slice().sort(sortIpStrings);
              return (
                <TR
                  key={m.id}
                  onClick={() =>
                    navigate(`/networks/${nwid}/members/${m.id}`)
                  }
                >
                  <TD onClick={(e) => e.stopPropagation()}>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={Boolean(m.authorized)}
                        onCheckedChange={() =>
                          toggle(m.id, Boolean(m.authorized))
                        }
                        aria-label="Authorize"
                      />
                    </div>
                  </TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {m.name || (
                          <span className="text-subtle italic">unnamed</span>
                        )}
                      </span>
                      {m.activeBridge ? (
                        <Badge tone="accent">bridge</Badge>
                      ) : null}
                      {m.authorized ? (
                        <Badge tone="success" className="gap-1">
                          <UserCheck2 className="h-3 w-3" />
                          auth
                        </Badge>
                      ) : (
                        <Badge tone="warn" className="gap-1">
                          <UserX2 className="h-3 w-3" />
                          pending
                        </Badge>
                      )}
                    </div>
                  </TD>
                  <TD mono>
                    <span className="inline-flex items-center gap-1.5">
                      {m.address ?? m.id}
                      <CopyButton value={m.address ?? m.id} />
                    </span>
                  </TD>
                  <TD>
                    {ips.length === 0 ? (
                      <span className="text-subtle text-xs">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {ips.slice(0, 3).map((ip) => (
                          <Badge key={ip} tone="outline" className="font-mono">
                            {ip}
                          </Badge>
                        ))}
                        {ips.length > 3 ? (
                          <Badge tone="muted">+{ips.length - 3}</Badge>
                        ) : null}
                      </div>
                    )}
                  </TD>
                  <TD>
                    {m.vMajor != null ? (
                      <span className="text-xs text-subtle">
                        v{m.vMajor}.{m.vMinor}.{m.vRev}
                      </span>
                    ) : (
                      <span className="text-xs text-subtle">—</span>
                    )}
                  </TD>
                  <TD className="text-right text-xs text-subtle">
                    <Link
                      to={`/networks/${nwid}/members/${m.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:underline"
                    >
                      {shortenId(m.id, 4, 4)} →
                    </Link>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      )}

      {memberId ? <MemberDrawer /> : null}
    </div>
  );
}

