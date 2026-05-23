import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/primitives/Input";
import { Button } from "@/components/primitives/Button";
import { EmptyState } from "@/components/primitives/EmptyState";
import { ipv4 } from "@/lib/validation";
import type { IpAssignmentPool } from "@/api/types";

export interface IpRangeEditorProps {
  value: IpAssignmentPool[];
  onChange: (next: IpAssignmentPool[]) => void;
}

export function IpRangeEditor({ value, onChange }: IpRangeEditorProps) {
  const add = () =>
    onChange([...(value ?? []), { ipRangeStart: "", ipRangeEnd: "" }]);
  const remove = (i: number) =>
    onChange(value.filter((_, idx) => idx !== i));
  const patch = (i: number, p: Partial<IpAssignmentPool>) =>
    onChange(value.map((row, idx) => (idx === i ? { ...row, ...p } : row)));

  return (
    <div className="space-y-2">
      {(!value || value.length === 0) && (
        <EmptyState
          title="No IP pools"
          description="Without a pool, ZeroTier won’t hand out addresses automatically."
          action={
            <Button onClick={add} variant="outline" size="sm">
              <Plus className="h-3.5 w-3.5" />
              Add pool
            </Button>
          }
        />
      )}
      {value && value.length > 0 ? (
        <div className="space-y-2">
          {value.map((row, i) => {
            const startValid = ipv4.safeParse(row.ipRangeStart).success;
            const endValid = ipv4.safeParse(row.ipRangeEnd).success;
            return (
              <div
                key={i}
                className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2"
              >
                <Input
                  monospace
                  placeholder="10.147.20.1"
                  value={row.ipRangeStart}
                  invalid={Boolean(row.ipRangeStart) && !startValid}
                  onChange={(e) =>
                    patch(i, { ipRangeStart: e.target.value.trim() })
                  }
                  aria-label="Start IP"
                />
                <span className="text-subtle text-xs">→</span>
                <Input
                  monospace
                  placeholder="10.147.20.254"
                  value={row.ipRangeEnd}
                  invalid={Boolean(row.ipRangeEnd) && !endValid}
                  onChange={(e) =>
                    patch(i, { ipRangeEnd: e.target.value.trim() })
                  }
                  aria-label="End IP"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(i)}
                  aria-label="Remove pool"
                >
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </div>
            );
          })}
          <Button onClick={add} variant="outline" size="sm">
            <Plus className="h-3.5 w-3.5" />
            Add pool
          </Button>
        </div>
      ) : null}
    </div>
  );
}
