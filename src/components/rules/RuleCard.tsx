import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  ShieldOff,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Select } from "@/components/primitives/Select";
import { Switch } from "@/components/primitives/Switch";
import { Button } from "@/components/primitives/Button";
import { Badge } from "@/components/primitives/Badge";
import { cn } from "@/lib/cn";
import type { Rule } from "@/api/types";
import { RuleFields } from "./ruleFields";
import { RULE_TYPES, RULE_TYPE_MAP, makeRule } from "./ruleTypes";

export interface RuleCardProps {
  id: string;
  rule: Rule;
  onChange: (next: Rule) => void;
  onRemove: () => void;
}

export function RuleCard({ id, rule, onChange, onRemove }: RuleCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const [open, setOpen] = useState(false);

  const meta = RULE_TYPE_MAP[rule.type];
  const isAction = meta?.group === "Action" || rule.type.startsWith("ACTION_");

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "rounded-lg border bg-panel transition-shadow",
        isDragging ? "shadow-pop border-accent" : "border-border shadow-soft",
      )}
    >
      <div className="flex items-center gap-2 px-2.5 py-2">
        <button
          type="button"
          className="text-subtle hover:text-fg cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="text-subtle hover:text-fg"
          aria-label={open ? "Collapse" : "Expand"}
        >
          {open ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        <Badge
          tone={isAction ? "accent" : "muted"}
          className="font-mono text-[10px]"
        >
          {isAction ? "ACTION" : "MATCH"}
        </Badge>
        <div className="flex-1 min-w-0">
          <Select
            value={rule.type}
            onValueChange={(t) => onChange({ ...makeRule(t) })}
            options={RULE_TYPES.map((r) => ({
              value: r.type,
              label: r.label,
              group: r.group,
            }))}
            triggerClassName="bg-transparent border-transparent hover:bg-muted h-8"
          />
        </div>
        {!isAction ? (
          <>
            <ModifierToggle
              label="not"
              icon={<ShieldOff className="h-3 w-3" />}
              checked={Boolean(rule.not)}
              onChange={(v) => onChange({ ...rule, not: v })}
            />
            <ModifierToggle
              label="or"
              icon={<ShieldCheck className="h-3 w-3" />}
              checked={Boolean(rule.or)}
              onChange={(v) => onChange({ ...rule, or: v })}
            />
          </>
        ) : null}
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label="Remove rule"
        >
          <Trash2 className="h-4 w-4 text-danger" />
        </Button>
      </div>

      {open && meta ? (
        <div className="px-3 pb-3">
          {meta.description ? (
            <p className="text-xs text-subtle">{meta.description}</p>
          ) : null}
          <RuleFields rule={rule} onChange={onChange} fields={meta.fields} />
        </div>
      ) : null}
      {open && !meta ? (
        <div className="px-3 pb-3">
          <p className="text-xs text-warn">
            Unknown rule type — fields preserved as-is on save.
          </p>
          <pre className="mt-2 text-[11px] font-mono bg-muted/40 rounded p-2 overflow-x-auto">
            {JSON.stringify(rule, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}

function ModifierToggle({
  label,
  icon,
  checked,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wide select-none cursor-pointer",
        checked
          ? "border-accent text-accent bg-accent/10"
          : "border-border text-subtle",
      )}
    >
      {icon}
      {label}
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="h-3 w-6 ml-1"
      />
    </label>
  );
}
