import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/primitives/Input";
import { Button } from "@/components/primitives/Button";
import { Field } from "@/components/primitives/Card";
import { ipAddress } from "@/lib/validation";
import type { Dns } from "@/api/types";

export interface DnsEditorProps {
  value: Dns | undefined;
  onChange: (next: Dns) => void;
}

export function DnsEditor({ value, onChange }: DnsEditorProps) {
  const current: Dns = {
    domain: value?.domain ?? "",
    servers: value?.servers ?? [],
  };

  const setDomain = (domain: string) => onChange({ ...current, domain });
  const setServer = (i: number, v: string) =>
    onChange({
      ...current,
      servers: current.servers.map((s, idx) => (idx === i ? v.trim() : s)),
    });
  const addServer = () =>
    onChange({ ...current, servers: [...current.servers, ""] });
  const removeServer = (i: number) =>
    onChange({
      ...current,
      servers: current.servers.filter((_, idx) => idx !== i),
    });

  return (
    <div className="space-y-4">
      <Field
        label="Search domain"
        hint="Pushed to members via the managed DNS table. e.g. lab.internal"
        htmlFor="dns-domain"
      >
        <Input
          id="dns-domain"
          value={current.domain ?? ""}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="lab.internal"
        />
      </Field>

      <div className="space-y-2">
        <div className="text-xs font-medium text-fg/80">Servers</div>
        {current.servers.length === 0 ? (
          <p className="text-xs text-subtle">
            No DNS servers configured. Members will keep their existing
            resolvers.
          </p>
        ) : (
          current.servers.map((srv, i) => {
            const ok = !srv || ipAddress.safeParse(srv).success;
            return (
              <div
                key={i}
                className="grid grid-cols-[1fr_auto] items-center gap-2"
              >
                <Input
                  monospace
                  placeholder="10.147.20.1"
                  value={srv}
                  invalid={!ok}
                  onChange={(e) => setServer(i, e.target.value)}
                  aria-label={`DNS server ${i + 1}`}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeServer(i)}
                  aria-label="Remove server"
                >
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </div>
            );
          })
        )}
        <Button onClick={addServer} variant="outline" size="sm">
          <Plus className="h-3.5 w-3.5" />
          Add server
        </Button>
      </div>
    </div>
  );
}
