import { useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Code2, FileText, Plus } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { Dropdown } from "@/components/primitives/DropdownMenu";
import { Badge } from "@/components/primitives/Badge";
import { EmptyState } from "@/components/primitives/EmptyState";
import { toast } from "@/store/uiStore";
import type { Rule } from "@/api/types";
import { RuleCard } from "./RuleCard";
import { RULE_TYPES, makeRule } from "./ruleTypes";
import { RULE_TEMPLATES } from "./rulesTemplates";

export interface RulesEditorProps {
  value: Rule[];
  onChange: (next: Rule[]) => void;
}

interface KeyedRule {
  key: string;
  rule: Rule;
}

let keyCounter = 0;
const ruleKey = () => `r${Date.now()}-${++keyCounter}`;

export function RulesEditor({ value, onChange }: RulesEditorProps) {
  const [showJson, setShowJson] = useState(false);
  const [jsonDraft, setJsonDraft] = useState<string>("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const keyed = useMemo<KeyedRule[]>(
    () => value.map((rule) => ({ key: ruleKey(), rule })),
    // We re-key on identity changes only when the array reference changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value === undefined],
  );
  // Maintain a stable parallel keyed list bound to current value length/order
  // For simplicity we re-derive on every render but reuse existing keys positionally.
  const sortableItems = useMemo(
    () => value.map((_, i) => `idx-${i}`),
    [value],
  );

  const addRule = (type: string) => {
    onChange([...value, makeRule(type)]);
  };

  const applyTemplate = (id: string) => {
    const tpl = RULE_TEMPLATES.find((t) => t.id === id);
    if (!tpl) return;
    onChange(tpl.rules.map((r) => ({ ...r })));
    toast("success", "Template applied", tpl.label);
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = sortableItems.indexOf(String(active.id));
    const to = sortableItems.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    onChange(arrayMove(value, from, to));
  };

  const updateAt = (i: number, next: Rule) => {
    onChange(value.map((r, idx) => (idx === i ? next : r)));
  };
  const removeAt = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i));
  };

  const switchToJson = () => {
    setJsonDraft(JSON.stringify(value, null, 2));
    setJsonError(null);
    setShowJson(true);
  };
  const applyJson = () => {
    try {
      const parsed = JSON.parse(jsonDraft);
      if (!Array.isArray(parsed))
        throw new Error("Rules must be an array");
      for (const r of parsed) {
        if (!r || typeof r !== "object" || typeof r.type !== "string") {
          throw new Error("Each rule needs a string `type`");
        }
      }
      onChange(parsed as Rule[]);
      setShowJson(false);
      toast("success", "JSON applied");
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : String(err));
    }
  };

  const actionItems = RULE_TYPES.filter((r) => r.group === "Action");
  const matchItems = RULE_TYPES.filter((r) => r.group === "Match");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Dropdown
          align="start"
          trigger={
            <Button variant="primary" size="sm">
              <Plus className="h-3.5 w-3.5" />
              Add rule
            </Button>
          }
          groups={[
            {
              label: "Match",
              items: matchItems.map((r) => ({
                label: r.label,
                onSelect: () => addRule(r.type),
              })),
            },
            {
              label: "Action",
              items: actionItems.map((r) => ({
                label: r.label,
                onSelect: () => addRule(r.type),
              })),
            },
          ]}
        />
        <Dropdown
          align="start"
          trigger={
            <Button variant="outline" size="sm">
              <FileText className="h-3.5 w-3.5" />
              Templates
            </Button>
          }
          groups={[
            {
              items: RULE_TEMPLATES.map((t) => ({
                label: t.label,
                onSelect: () => applyTemplate(t.id),
              })),
            },
          ]}
        />
        <div className="flex-1" />
        <Badge tone="muted">{value.length} rules</Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => (showJson ? setShowJson(false) : switchToJson())}
        >
          <Code2 className="h-3.5 w-3.5" />
          {showJson ? "Hide JSON" : "View JSON"}
        </Button>
      </div>

      {showJson ? (
        <div className="space-y-2">
          <textarea
            spellCheck={false}
            value={jsonDraft}
            onChange={(e) => {
              setJsonDraft(e.target.value);
              setJsonError(null);
            }}
            className="w-full font-mono text-xs rounded-md border border-border bg-panel p-3 min-h-[280px]"
          />
          {jsonError ? (
            <div className="text-xs text-danger">{jsonError}</div>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowJson(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={applyJson}>
              Apply JSON
            </Button>
          </div>
        </div>
      ) : value.length === 0 ? (
        <EmptyState
          title="No flow rules"
          description={
            <>
              Without explicit rules, ZeroTier accepts everything. Add a rule or
              apply a template to start filtering.
            </>
          }
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={sortableItems}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {value.map((r, i) => (
                <RuleCard
                  key={keyed[i]?.key ?? `idx-${i}`}
                  id={`idx-${i}`}
                  rule={r}
                  onChange={(next) => updateAt(i, next)}
                  onRemove={() => removeAt(i)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
