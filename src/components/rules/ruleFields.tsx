import { Input } from "@/components/primitives/Input";
import { NumberInput } from "@/components/primitives/NumberInput";
import { Select } from "@/components/primitives/Select";
import { Field } from "@/components/primitives/Card";
import { cidr, ipv4, macAddr, memberId, portNumber } from "@/lib/validation";
import type { Rule } from "@/api/types";
import {
  ETHERTYPES,
  IP_PROTOCOLS,
  type FieldDef,
} from "./ruleTypes";

export function RuleFields({
  rule,
  onChange,
  fields,
}: {
  rule: Rule;
  onChange: (next: Rule) => void;
  fields: FieldDef[];
}) {
  if (fields.length === 0) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
      {fields.map((f, i) => (
        <RuleFieldOne key={i} rule={rule} onChange={onChange} field={f} />
      ))}
    </div>
  );
}

function RuleFieldOne({
  rule,
  onChange,
  field,
}: {
  rule: Rule;
  onChange: (next: Rule) => void;
  field: FieldDef;
}) {
  switch (field.kind) {
    case "zt-address":
      return <ZtAddress rule={rule} onChange={onChange} keyName={field.keys![0]!} label={field.label} />;
    case "ethertype":
      return <EtherType rule={rule} onChange={onChange} keyName={field.keys![0]!} />;
    case "mac":
      return <MacField rule={rule} onChange={onChange} keyName={field.keys![0]!} />;
    case "cidr":
      return <CidrField rule={rule} onChange={onChange} keyName={field.keys![0]!} />;
    case "ip-protocol":
      return <IpProtocolField rule={rule} onChange={onChange} keyName={field.keys![0]!} />;
    case "port-range":
      return <PortRangeField rule={rule} onChange={onChange} keys={field.keys!} />;
    case "integer-range":
      return <IntegerRangeField rule={rule} onChange={onChange} keys={field.keys!} />;
    case "single-number":
      return <SingleNumber rule={rule} onChange={onChange} keyName={field.keys![0]!} label={field.label} />;
    case "characteristics":
      return <Characteristics rule={rule} onChange={onChange} keys={field.keys!} />;
    case "tag-id-value":
      return <TagIdValue rule={rule} onChange={onChange} keys={field.keys!} />;
  }
}

function setKey(rule: Rule, key: string, value: unknown): Rule {
  return { ...rule, [key]: value };
}

function ZtAddress({
  rule,
  onChange,
  keyName,
  label,
}: {
  rule: Rule;
  onChange: (n: Rule) => void;
  keyName: string;
  label?: string;
}) {
  const v = String(rule[keyName] ?? "");
  const ok = !v || memberId.safeParse(v).success;
  return (
    <Field label={label ?? "ZeroTier address"}>
      <Input
        monospace
        placeholder="aabbccdd11"
        value={v}
        invalid={!ok}
        onChange={(e) =>
          onChange(setKey(rule, keyName, e.target.value.trim().toLowerCase()))
        }
      />
    </Field>
  );
}

function EtherType({
  rule,
  onChange,
  keyName,
}: {
  rule: Rule;
  onChange: (n: Rule) => void;
  keyName: string;
}) {
  const v = Number(rule[keyName] ?? 0);
  return (
    <Field label="EtherType">
      <div className="grid grid-cols-2 gap-2">
        <Select
          value={String(v)}
          onValueChange={(s) => onChange(setKey(rule, keyName, Number(s)))}
          options={[
            ...ETHERTYPES.map((e) => ({
              value: String(e.value),
              label: e.label,
            })),
            { value: String(v), label: `Custom (0x${v.toString(16)})` },
          ]}
        />
        <NumberInput
          value={v}
          onChange={(n) => onChange(setKey(rule, keyName, n ?? 0))}
          placeholder="decimal"
        />
      </div>
    </Field>
  );
}

function MacField({
  rule,
  onChange,
  keyName,
}: {
  rule: Rule;
  onChange: (n: Rule) => void;
  keyName: string;
}) {
  const v = String(rule[keyName] ?? "");
  const ok = !v || macAddr.safeParse(v).success;
  return (
    <Field label="MAC address">
      <Input
        monospace
        placeholder="aa:bb:cc:dd:ee:ff"
        value={v}
        invalid={!ok}
        onChange={(e) =>
          onChange(setKey(rule, keyName, e.target.value.trim().toLowerCase()))
        }
      />
    </Field>
  );
}

function CidrField({
  rule,
  onChange,
  keyName,
}: {
  rule: Rule;
  onChange: (n: Rule) => void;
  keyName: string;
}) {
  const v = String(rule[keyName] ?? "");
  const ok = !v || cidr.safeParse(v).success || ipv4.safeParse(v).success;
  return (
    <Field label="CIDR">
      <Input
        monospace
        placeholder="10.0.0.0/8"
        value={v}
        invalid={!ok}
        onChange={(e) => onChange(setKey(rule, keyName, e.target.value.trim()))}
      />
    </Field>
  );
}

function IpProtocolField({
  rule,
  onChange,
  keyName,
}: {
  rule: Rule;
  onChange: (n: Rule) => void;
  keyName: string;
}) {
  const v = Number(rule[keyName] ?? 6);
  const optionVals = IP_PROTOCOLS.map((p) => p.value);
  const opts = optionVals.includes(v)
    ? IP_PROTOCOLS
    : [...IP_PROTOCOLS, { value: v, label: `Custom (${v})` }];
  return (
    <Field label="Protocol">
      <Select
        value={String(v)}
        onValueChange={(s) => onChange(setKey(rule, keyName, Number(s)))}
        options={opts.map((p) => ({
          value: String(p.value),
          label: p.label,
        }))}
      />
    </Field>
  );
}

function PortRangeField({
  rule,
  onChange,
  keys,
}: {
  rule: Rule;
  onChange: (n: Rule) => void;
  keys: string[];
}) {
  const [sk, ek] = keys;
  const start = Number(rule[sk!] ?? 0);
  const end = Number(rule[ek!] ?? 65535);
  const sOk = portNumber.safeParse(start).success;
  const eOk = portNumber.safeParse(end).success;
  return (
    <Field label="Port range">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <NumberInput
          value={start}
          invalid={!sOk}
          onChange={(n) => onChange(setKey(rule, sk!, n ?? 0))}
        />
        <span className="text-subtle text-xs">→</span>
        <NumberInput
          value={end}
          invalid={!eOk}
          onChange={(n) => onChange(setKey(rule, ek!, n ?? 0))}
        />
      </div>
    </Field>
  );
}

function IntegerRangeField({
  rule,
  onChange,
  keys,
}: {
  rule: Rule;
  onChange: (n: Rule) => void;
  keys: string[];
}) {
  const [sk, ek] = keys;
  return (
    <Field label="Range">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <NumberInput
          value={Number(rule[sk!] ?? 0)}
          onChange={(n) => onChange(setKey(rule, sk!, n ?? 0))}
        />
        <span className="text-subtle text-xs">→</span>
        <NumberInput
          value={Number(rule[ek!] ?? 0)}
          onChange={(n) => onChange(setKey(rule, ek!, n ?? 0))}
        />
      </div>
    </Field>
  );
}

function SingleNumber({
  rule,
  onChange,
  keyName,
  label,
}: {
  rule: Rule;
  onChange: (n: Rule) => void;
  keyName: string;
  label?: string;
}) {
  return (
    <Field label={label ?? keyName}>
      <NumberInput
        value={Number(rule[keyName] ?? 0)}
        onChange={(n) => onChange(setKey(rule, keyName, n ?? 0))}
      />
    </Field>
  );
}

function Characteristics({
  rule,
  onChange,
  keys,
}: {
  rule: Rule;
  onChange: (n: Rule) => void;
  keys: string[];
}) {
  const [mk, vk] = keys;
  return (
    <>
      <Field label="Mask (hex)">
        <Input
          monospace
          placeholder="0x0"
          value={String(rule[mk!] ?? "0x0")}
          onChange={(e) =>
            onChange(setKey(rule, mk!, e.target.value.trim()))
          }
        />
      </Field>
      <Field label="Value (hex)">
        <Input
          monospace
          placeholder="0x0"
          value={String(rule[vk!] ?? "0x0")}
          onChange={(e) =>
            onChange(setKey(rule, vk!, e.target.value.trim()))
          }
        />
      </Field>
    </>
  );
}

function TagIdValue({
  rule,
  onChange,
  keys,
}: {
  rule: Rule;
  onChange: (n: Rule) => void;
  keys: string[];
}) {
  const [ik, vk] = keys;
  return (
    <>
      <Field label="Tag id">
        <NumberInput
          value={Number(rule[ik!] ?? 0)}
          onChange={(n) => onChange(setKey(rule, ik!, n ?? 0))}
        />
      </Field>
      <Field label="Tag value">
        <NumberInput
          value={Number(rule[vk!] ?? 0)}
          onChange={(n) => onChange(setKey(rule, vk!, n ?? 0))}
        />
      </Field>
    </>
  );
}
