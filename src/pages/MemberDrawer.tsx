import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, Trash2, Plus } from "lucide-react";
import {
  useDeleteMember,
  useMember,
  useUpsertMember,
} from "@/hooks/useMembers";
import { useNetwork } from "@/hooks/useNetworks";
import { Drawer } from "@/components/primitives/Dialog";
import { Field } from "@/components/primitives/Card";
import { Input } from "@/components/primitives/Input";
import { Switch } from "@/components/primitives/Switch";
import { Button } from "@/components/primitives/Button";
import { Badge } from "@/components/primitives/Badge";
import { CopyButton } from "@/components/primitives/CopyButton";
import { ConfirmDialog } from "@/components/primitives/ConfirmDialog";
import { ToggleField } from "@/components/primitives/ToggleField";
import { KV } from "@/components/primitives/KV";
import { ipv4, ipv6 } from "@/lib/validation";
import { useApiError } from "@/hooks/useApiError";
import { toast } from "@/store/uiStore";
import {
  formatRelativeTime,
  formatAbsoluteTime,
  shortenId,
} from "@/lib/format";
import type { Member } from "@/api/types";

interface Draft {
  name: string;
  authorized: boolean;
  activeBridge: boolean;
  noAutoAssignIps: boolean;
  ipAssignments: string[];
  tags: [number, number][];
  capabilities: number[];
}

function toDraft(m: Member): Draft {
  return {
    name: m.name ?? "",
    authorized: m.authorized ?? false,
    activeBridge: m.activeBridge ?? false,
    noAutoAssignIps: m.noAutoAssignIps ?? false,
    ipAssignments: m.ipAssignments ?? [],
    tags: m.tags ?? [],
    capabilities: m.capabilities ?? [],
  };
}

export function MemberDrawer() {
  const { nwid, memberId } = useParams();
  const navigate = useNavigate();
  const member = useMember(nwid, memberId);
  const network = useNetwork(nwid);
  const upsert = useUpsertMember(nwid!);
  const del = useDeleteMember(nwid!);
  const onError = useApiError();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);

  useEffect(() => {
    if (member.data) setDraft(toDraft(member.data));
  }, [member.data]);

  const close = () => navigate(`/networks/${nwid}/members`);

  const onSave = async () => {
    if (!draft || !memberId) return;
    try {
      await upsert.mutateAsync({
        memberId,
        patch: { ...draft } as Partial<Member>,
      });
      toast("success", "Member saved");
    } catch (err) {
      onError(err, "Save failed");
    }
  };

  const onDelete = async () => {
    if (!memberId) return;
    try {
      await del.mutateAsync(memberId);
      toast("success", "Member removed");
      close();
    } catch (err) {
      onError(err, "Delete failed");
    }
  };

  return (
    <>
      <Drawer
        open={Boolean(memberId)}
        onOpenChange={(o) => {
          if (!o) close();
        }}
        title={
          <span className="inline-flex items-center gap-2">
            Member
            <code className="text-xs font-mono text-subtle">
              {shortenId(memberId ?? "", 4, 4)}
            </code>
            {member.data?.authorized ? (
              <Badge tone="success">authorized</Badge>
            ) : (
              <Badge tone="warn">pending</Badge>
            )}
          </span>
        }
        description={
          member.data?.address ? (
            <span className="inline-flex items-center gap-1.5 font-mono text-xs">
              {member.data.address}
              <CopyButton value={member.data.address} />
            </span>
          ) : undefined
        }
        width="md"
        footer={
          draft ? (
            <>
              <Button
                variant="ghost"
                onClick={() => setConfirmDel(true)}
                disabled={upsert.isPending}
              >
                <Trash2 className="h-4 w-4 text-danger" />
                Remove
              </Button>
              <div className="flex-1" />
              <Button variant="ghost" onClick={close}>
                Close
              </Button>
              <Button onClick={onSave} loading={upsert.isPending}>
                <Save className="h-4 w-4" />
                Save
              </Button>
            </>
          ) : null
        }
      >
        {!draft ? null : (
          <div className="space-y-5">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border">
              <Switch
                checked={draft.authorized}
                onCheckedChange={(v) =>
                  setDraft({ ...draft, authorized: v })
                }
              />
              <div className="text-sm">
                <div className="font-medium">Authorized</div>
                <div className="text-xs text-subtle">
                  Turning this off immediately disconnects the member.
                </div>
              </div>
            </div>

            <Field label="Name (controller-side label)" htmlFor="mname">
              <Input
                id="mname"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="laptop-bob"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <ToggleField
                variant="card"
                label="Active bridge"
                description="Forward Ethernet frames to/from physical network."
                checked={draft.activeBridge}
                onChange={(v) => setDraft({ ...draft, activeBridge: v })}
              />
              <ToggleField
                variant="card"
                label="No auto-assign IPs"
                description="Skip auto IP allocation; assign manually below."
                checked={draft.noAutoAssignIps}
                onChange={(v) => setDraft({ ...draft, noAutoAssignIps: v })}
              />
            </div>

            <IpAssignmentsEditor
              value={draft.ipAssignments}
              onChange={(v) => setDraft({ ...draft, ipAssignments: v })}
            />

            <CapabilitiesPicker
              available={network.data?.capabilities ?? []}
              value={draft.capabilities}
              onChange={(v) => setDraft({ ...draft, capabilities: v })}
            />

            <TagAssignmentsEditor
              available={network.data?.tags ?? []}
              value={draft.tags}
              onChange={(v) => setDraft({ ...draft, tags: v })}
            />

            <DetailsBlock m={member.data!} />
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={confirmDel}
        onOpenChange={setConfirmDel}
        title="Remove this member?"
        description="The member will be disconnected and removed from the controller's member list."
        confirmLabel="Remove"
        danger
        loading={del.isPending}
        onConfirm={onDelete}
      />
    </>
  );
}

function IpAssignmentsEditor({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const add = () => onChange([...value, ""]);
  const remove = (i: number) => onChange(value.filter((_, x) => x !== i));
  const patch = (i: number, v: string) =>
    onChange(value.map((row, x) => (x === i ? v.trim() : row)));

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-fg/80">IP assignments</div>
      {value.length === 0 ? (
        <p className="text-xs text-subtle">
          No manual assignments. The controller will pick from pools (unless
          “no auto-assign” is on).
        </p>
      ) : null}
      {value.map((ip, i) => {
        const ok =
          !ip || ipv4.safeParse(ip).success || ipv6.safeParse(ip).success;
        return (
          <div
            key={i}
            className="grid grid-cols-[1fr_auto] items-center gap-2"
          >
            <Input
              monospace
              placeholder="10.147.20.42"
              value={ip}
              invalid={!ok}
              onChange={(e) => patch(i, e.target.value)}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => remove(i)}
              aria-label="Remove IP"
            >
              <Trash2 className="h-4 w-4 text-danger" />
            </Button>
          </div>
        );
      })}
      <Button variant="outline" size="sm" onClick={add}>
        <Plus className="h-3.5 w-3.5" />
        Add IP
      </Button>
    </div>
  );
}

function CapabilitiesPicker({
  available,
  value,
  onChange,
}: {
  available: { id: number }[];
  value: number[];
  onChange: (v: number[]) => void;
}) {
  if (available.length === 0) {
    return (
      <div>
        <div className="text-xs font-medium text-fg/80 mb-1">Capabilities</div>
        <p className="text-xs text-subtle">
          No network-level capabilities defined. Add them under{" "}
          <strong>Caps &amp; Tags</strong> first.
        </p>
      </div>
    );
  }

  const toggle = (id: number) =>
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);

  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-fg/80">Capabilities</div>
      <div className="flex flex-wrap gap-1.5">
        {available.map((c) => {
          const on = value.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggle(c.id)}
              className={
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors " +
                (on
                  ? "bg-accent text-accent-fg border-accent"
                  : "border-border bg-panel hover:bg-muted")
              }
            >
              cap #{c.id}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TagAssignmentsEditor({
  available,
  value,
  onChange,
}: {
  available: { id: number; default?: number | null }[];
  value: [number, number][];
  onChange: (v: [number, number][]) => void;
}) {
  if (available.length === 0) {
    return (
      <div>
        <div className="text-xs font-medium text-fg/80 mb-1">Tags</div>
        <p className="text-xs text-subtle">
          No network-level tags defined. Add them under{" "}
          <strong>Caps &amp; Tags</strong> first.
        </p>
      </div>
    );
  }

  const get = (id: number) =>
    value.find((t) => t[0] === id)?.[1] ?? null;
  const set = (id: number, raw: string) => {
    const n = raw === "" ? null : Number(raw);
    if (n === null || !Number.isFinite(n)) {
      onChange(value.filter((t) => t[0] !== id));
    } else {
      const without = value.filter((t) => t[0] !== id);
      onChange([...without, [id, n]]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-fg/80">Tags</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {available.map((t) => {
          const cur = get(t.id);
          return (
            <div
              key={t.id}
              className="flex items-center gap-2 rounded-md border border-border p-2"
            >
              <div className="text-sm font-mono w-12">#{t.id}</div>
              <Input
                placeholder={`default ${t.default ?? "—"}`}
                inputMode="numeric"
                value={cur == null ? "" : String(cur)}
                onChange={(e) => set(t.id, e.target.value)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DetailsBlock({ m }: { m: Member }) {
  const clientVersion =
    m.vMajor != null
      ? `v${m.vMajor}.${m.vMinor}.${m.vRev} (proto ${m.vProto})`
      : "—";
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs space-y-2">
      <div className="text-fg font-medium">Telemetry</div>
      <KV label="Last authorized" mono>
        {formatAbsoluteTime(m.lastAuthorizedTime ?? null)}
      </KV>
      <KV label="Last deauthorized" mono>
        {formatAbsoluteTime(m.lastDeauthorizedTime ?? null)}
      </KV>
      <KV label="Created" mono>
        {formatRelativeTime(m.creationTime ?? null)}
      </KV>
      <KV label="Client" mono divider={false}>
        {clientVersion}
      </KV>
    </div>
  );
}
