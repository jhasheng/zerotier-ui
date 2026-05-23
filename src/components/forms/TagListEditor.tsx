import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/primitives/Input";
import { NumberInput } from "@/components/primitives/NumberInput";
import { Button } from "@/components/primitives/Button";
import type { Tag } from "@/api/types";

export interface TagListEditorProps {
  value: Tag[];
  onChange: (next: Tag[]) => void;
}

export function TagListEditor({ value, onChange }: TagListEditorProps) {
  const add = () => {
    const nextId =
      value.length === 0 ? 1 : Math.max(...value.map((t) => t.id)) + 1;
    onChange([...value, { id: nextId, default: 0 }]);
  };
  const remove = (i: number) => onChange(value.filter((_, x) => x !== i));
  const patch = (i: number, p: Partial<Tag>) =>
    onChange(value.map((row, x) => (x === i ? { ...row, ...p } : row)));

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[100px_1fr_auto] gap-2 text-xs text-subtle px-1">
        <span>Tag ID</span>
        <span>Default value</span>
        <span></span>
      </div>
      {value.map((tag, i) => (
        <div
          key={i}
          className="grid grid-cols-[100px_1fr_auto] items-center gap-2"
        >
          <Input
            value={String(tag.id)}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) patch(i, { id: n });
            }}
            inputMode="numeric"
            placeholder="id"
            monospace
          />
          <NumberInput
            value={tag.default ?? null}
            onChange={(v) => patch(i, { default: v })}
            placeholder="default (optional)"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => remove(i)}
            aria-label="Remove tag"
          >
            <Trash2 className="h-4 w-4 text-danger" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add}>
        <Plus className="h-3.5 w-3.5" />
        Add tag definition
      </Button>
    </div>
  );
}
