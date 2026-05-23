import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/primitives/Input";
import { Button } from "@/components/primitives/Button";
import { Switch } from "@/components/primitives/Switch";
import { Badge } from "@/components/primitives/Badge";
import type { Capability } from "@/api/types";

export interface CapabilityEditorProps {
  value: Capability[];
  onChange: (next: Capability[]) => void;
}

export function CapabilityEditor({ value, onChange }: CapabilityEditorProps) {
  const add = () => {
    const nextId =
      value.length === 0 ? 1 : Math.max(...value.map((c) => c.id)) + 1;
    onChange([
      ...value,
      { id: nextId, default: false, rules: [{ type: "ACTION_ACCEPT" }] },
    ]);
  };
  const remove = (i: number) => onChange(value.filter((_, x) => x !== i));
  const patch = (i: number, p: Partial<Capability>) =>
    onChange(value.map((row, x) => (x === i ? { ...row, ...p } : row)));

  return (
    <div className="space-y-2">
      {value.length === 0 ? (
        <p className="text-xs text-subtle">
          No capabilities yet. Capabilities are named rule bundles you can assign
          to members.
        </p>
      ) : (
        value.map((cap, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-muted/20 p-3 space-y-2"
          >
            <div className="flex items-center gap-3">
              <div className="text-xs text-subtle">ID</div>
              <Input
                value={String(cap.id)}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (Number.isFinite(n)) patch(i, { id: n });
                }}
                inputMode="numeric"
                monospace
                className="max-w-[120px]"
              />
              <Badge tone="muted">{cap.rules.length} rules</Badge>
              <label className="ml-auto inline-flex items-center gap-2 text-xs">
                Default-on
                <Switch
                  checked={Boolean(cap.default)}
                  onCheckedChange={(v) => patch(i, { default: v })}
                />
              </label>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove(i)}
                aria-label="Remove capability"
              >
                <Trash2 className="h-4 w-4 text-danger" />
              </Button>
            </div>
            <p className="text-xs text-subtle">
              Capability inner rules are defined as JSON for now. Use the network
              Flow Rules tab pattern (extend later).
            </p>
            <textarea
              spellCheck={false}
              value={JSON.stringify(cap.rules ?? [], null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  if (Array.isArray(parsed)) patch(i, { rules: parsed });
                } catch {
                  // ignore; the textarea remains as user typed
                }
              }}
              className="w-full font-mono text-xs rounded-md border border-border bg-panel p-2 min-h-[120px]"
            />
          </div>
        ))
      )}
      <Button variant="outline" size="sm" onClick={add}>
        <Plus className="h-3.5 w-3.5" />
        Add capability
      </Button>
    </div>
  );
}
