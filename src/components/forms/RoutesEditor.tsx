import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/primitives/Input";
import { Button } from "@/components/primitives/Button";
import { EmptyState } from "@/components/primitives/EmptyState";
import { cidr, ipAddress } from "@/lib/validation";
import type { Route } from "@/api/types";

export interface RoutesEditorProps {
  value: Route[];
  onChange: (next: Route[]) => void;
}

export function RoutesEditor({ value, onChange }: RoutesEditorProps) {
  const add = () =>
    onChange([...(value ?? []), { target: "", via: null }]);
  const remove = (i: number) =>
    onChange(value.filter((_, idx) => idx !== i));
  const patch = (i: number, p: Partial<Route>) =>
    onChange(value.map((row, idx) => (idx === i ? { ...row, ...p } : row)));

  if (!value || value.length === 0) {
    return (
      <EmptyState
        title="No routes"
        description="At minimum, add a route for each managed CIDR so members route traffic via ZeroTier."
        action={
          <Button onClick={add} variant="outline" size="sm">
            <Plus className="h-3.5 w-3.5" />
            Add route
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-2">
      {value.map((row, i) => {
        const targetValid = cidr.safeParse(row.target).success;
        const viaValid =
          !row.via || row.via === "" || ipAddress.safeParse(row.via).success;
        return (
          <div
            key={i}
            className="grid grid-cols-[1fr_1fr_auto] items-center gap-2"
          >
            <Input
              monospace
              placeholder="10.147.20.0/24"
              value={row.target}
              invalid={Boolean(row.target) && !targetValid}
              onChange={(e) => patch(i, { target: e.target.value.trim() })}
              aria-label="Target CIDR"
            />
            <Input
              monospace
              placeholder="via (optional, e.g. 10.147.20.1)"
              value={row.via ?? ""}
              invalid={!viaValid}
              onChange={(e) => {
                const v = e.target.value.trim();
                patch(i, { via: v === "" ? null : v });
              }}
              aria-label="Via gateway"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => remove(i)}
              aria-label="Remove route"
            >
              <Trash2 className="h-4 w-4 text-danger" />
            </Button>
          </div>
        );
      })}
      <Button onClick={add} variant="outline" size="sm">
        <Plus className="h-3.5 w-3.5" />
        Add route
      </Button>
    </div>
  );
}
