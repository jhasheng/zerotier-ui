import { ToggleField } from "@/components/primitives/ToggleField";
import type { V4AssignMode, V6AssignMode } from "@/api/types";

export function V4AssignToggle({
  value,
  onChange,
}: {
  value: V4AssignMode | undefined;
  onChange: (v: V4AssignMode) => void;
}) {
  const current = value ?? { zt: false };
  return (
    <ToggleField
      label="ZeroTier-managed IPv4"
      description="Assign IPv4 from pool; clients pull addresses via the controller."
      checked={current.zt}
      onChange={(v) => onChange({ zt: v })}
    />
  );
}

export function V6AssignToggle({
  value,
  onChange,
}: {
  value: V6AssignMode | undefined;
  onChange: (v: V6AssignMode) => void;
}) {
  const current: V6AssignMode = value ?? {
    zt: false,
    "6plane": false,
    rfc4193: false,
  };
  const set = (patch: Partial<V6AssignMode>) =>
    onChange({ ...current, ...patch });

  return (
    <div className="space-y-3">
      <ToggleField
        label="ZeroTier-managed IPv6"
        description="Assign IPv6 from pool."
        checked={current.zt}
        onChange={(v) => set({ zt: v })}
      />
      <ToggleField
        label="6plane"
        description="Auto-derive a /80 from the NWID + member address."
        checked={current["6plane"]}
        onChange={(v) => set({ "6plane": v })}
      />
      <ToggleField
        label="RFC4193"
        description="Private fc00::/7 deterministic addressing."
        checked={current.rfc4193}
        onChange={(v) => set({ rfc4193: v })}
      />
    </div>
  );
}
