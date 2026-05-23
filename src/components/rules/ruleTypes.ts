import type { Rule } from "@/api/types";

export type FieldKind =
  | "zt-address"
  | "ethertype"
  | "mac"
  | "cidr"
  | "ip-protocol"
  | "port-range"
  | "integer-range"
  | "single-number"
  | "characteristics"
  | "tag-id-value";

export interface FieldDef {
  kind: FieldKind;
  // For composite kinds the renderer knows which keys to set on the rule
  keys?: string[];
  label?: string;
}

export type RuleGroup = "Action" | "Match";

export interface RuleTypeMeta {
  type: string;
  label: string;
  group: RuleGroup;
  description?: string;
  fields: FieldDef[];
  defaults?: () => Partial<Rule>;
}

const ACTIONS: RuleTypeMeta[] = [
  {
    type: "ACTION_ACCEPT",
    label: "Accept",
    group: "Action",
    description: "Allow the packet — terminal action for this chain.",
    fields: [],
  },
  {
    type: "ACTION_DROP",
    label: "Drop",
    group: "Action",
    description: "Discard the packet — terminal action.",
    fields: [],
  },
  {
    type: "ACTION_BREAK",
    label: "Break",
    group: "Action",
    description:
      "Stop evaluating further rules in this scope but continue downstream.",
    fields: [],
  },
  {
    type: "ACTION_TEE",
    label: "Tee (mirror)",
    group: "Action",
    description: "Send a copy of the packet to another member.",
    fields: [
      { kind: "zt-address", keys: ["address"], label: "Mirror to" },
      { kind: "single-number", keys: ["flags"], label: "Flags" },
      { kind: "single-number", keys: ["length"], label: "Capture length" },
    ],
    defaults: () => ({ address: "0000000000", flags: 0, length: 0 }),
  },
  {
    type: "ACTION_REDIRECT",
    label: "Redirect",
    group: "Action",
    description: "Force-route the packet via another member.",
    fields: [
      { kind: "zt-address", keys: ["address"], label: "Redirect to" },
      { kind: "single-number", keys: ["flags"], label: "Flags" },
    ],
    defaults: () => ({ address: "0000000000", flags: 0 }),
  },
  {
    type: "ACTION_WATCH",
    label: "Watch",
    group: "Action",
    description: "Mirror to another member without sending the original packet.",
    fields: [
      { kind: "zt-address", keys: ["address"], label: "Watch via" },
      { kind: "single-number", keys: ["flags"], label: "Flags" },
      { kind: "single-number", keys: ["length"], label: "Capture length" },
    ],
    defaults: () => ({ address: "0000000000", flags: 0, length: 0 }),
  },
  {
    type: "ACTION_PRIORITY",
    label: "Set priority",
    group: "Action",
    description: "Assign QoS bucket (0–7).",
    fields: [
      { kind: "single-number", keys: ["qosBucket"], label: "QoS bucket (0-7)" },
    ],
    defaults: () => ({ qosBucket: 0 }),
  },
];

const MATCHES: RuleTypeMeta[] = [
  {
    type: "MATCH_SOURCE_ZEROTIER_ADDRESS",
    label: "Source ZT address",
    group: "Match",
    fields: [{ kind: "zt-address", keys: ["zt"] }],
    defaults: () => ({ zt: "0000000000" }),
  },
  {
    type: "MATCH_DEST_ZEROTIER_ADDRESS",
    label: "Destination ZT address",
    group: "Match",
    fields: [{ kind: "zt-address", keys: ["zt"] }],
    defaults: () => ({ zt: "0000000000" }),
  },
  {
    type: "MATCH_ETHERTYPE",
    label: "EtherType",
    group: "Match",
    fields: [{ kind: "ethertype", keys: ["etherType"] }],
    defaults: () => ({ etherType: 0x0800 }),
  },
  {
    type: "MATCH_MAC_SOURCE",
    label: "Source MAC",
    group: "Match",
    fields: [{ kind: "mac", keys: ["mac"] }],
    defaults: () => ({ mac: "00:00:00:00:00:00" }),
  },
  {
    type: "MATCH_MAC_DEST",
    label: "Destination MAC",
    group: "Match",
    fields: [{ kind: "mac", keys: ["mac"] }],
    defaults: () => ({ mac: "00:00:00:00:00:00" }),
  },
  {
    type: "MATCH_IPV4_SOURCE",
    label: "Source IPv4",
    group: "Match",
    fields: [{ kind: "cidr", keys: ["ip"] }],
    defaults: () => ({ ip: "0.0.0.0/0" }),
  },
  {
    type: "MATCH_IPV4_DEST",
    label: "Destination IPv4",
    group: "Match",
    fields: [{ kind: "cidr", keys: ["ip"] }],
    defaults: () => ({ ip: "0.0.0.0/0" }),
  },
  {
    type: "MATCH_IPV6_SOURCE",
    label: "Source IPv6",
    group: "Match",
    fields: [{ kind: "cidr", keys: ["ip"] }],
    defaults: () => ({ ip: "::/0" }),
  },
  {
    type: "MATCH_IPV6_DEST",
    label: "Destination IPv6",
    group: "Match",
    fields: [{ kind: "cidr", keys: ["ip"] }],
    defaults: () => ({ ip: "::/0" }),
  },
  {
    type: "MATCH_IP_PROTOCOL",
    label: "IP protocol",
    group: "Match",
    fields: [{ kind: "ip-protocol", keys: ["ipProtocol"] }],
    defaults: () => ({ ipProtocol: 6 }),
  },
  {
    type: "MATCH_IP_TOS",
    label: "IP ToS",
    group: "Match",
    fields: [
      { kind: "single-number", keys: ["ipTos"], label: "ToS value" },
      { kind: "single-number", keys: ["mask"], label: "Mask" },
    ],
    defaults: () => ({ ipTos: 0, mask: 0xff }),
  },
  {
    type: "MATCH_IP_SOURCE_PORT_RANGE",
    label: "Source port range",
    group: "Match",
    fields: [{ kind: "port-range", keys: ["start", "end"] }],
    defaults: () => ({ start: 0, end: 65535 }),
  },
  {
    type: "MATCH_IP_DEST_PORT_RANGE",
    label: "Destination port range",
    group: "Match",
    fields: [{ kind: "port-range", keys: ["start", "end"] }],
    defaults: () => ({ start: 0, end: 65535 }),
  },
  {
    type: "MATCH_FRAME_SIZE_RANGE",
    label: "Frame size range (bytes)",
    group: "Match",
    fields: [{ kind: "integer-range", keys: ["start", "end"] }],
    defaults: () => ({ start: 0, end: 9000 }),
  },
  {
    type: "MATCH_CHARACTERISTICS",
    label: "Frame characteristics",
    group: "Match",
    fields: [{ kind: "characteristics", keys: ["mask", "value"] }],
    defaults: () => ({ mask: "0x0", value: "0x0" }),
  },
  {
    type: "MATCH_TAG_SENDER",
    label: "Tag (sender)",
    group: "Match",
    fields: [{ kind: "tag-id-value", keys: ["id", "value"] }],
    defaults: () => ({ id: 0, value: 0 }),
  },
  {
    type: "MATCH_TAG_RECEIVER",
    label: "Tag (receiver)",
    group: "Match",
    fields: [{ kind: "tag-id-value", keys: ["id", "value"] }],
    defaults: () => ({ id: 0, value: 0 }),
  },
  {
    type: "MATCH_TAGS_EQUAL",
    label: "Tags equal (both ends)",
    group: "Match",
    fields: [{ kind: "tag-id-value", keys: ["id", "value"] }],
    defaults: () => ({ id: 0, value: 0 }),
  },
  {
    type: "MATCH_TAGS_BITWISE_AND",
    label: "Tag bitwise AND",
    group: "Match",
    fields: [{ kind: "tag-id-value", keys: ["id", "value"] }],
    defaults: () => ({ id: 0, value: 0 }),
  },
  {
    type: "MATCH_TAGS_BITWISE_OR",
    label: "Tag bitwise OR",
    group: "Match",
    fields: [{ kind: "tag-id-value", keys: ["id", "value"] }],
    defaults: () => ({ id: 0, value: 0 }),
  },
  {
    type: "MATCH_TAGS_BITWISE_XOR",
    label: "Tag bitwise XOR",
    group: "Match",
    fields: [{ kind: "tag-id-value", keys: ["id", "value"] }],
    defaults: () => ({ id: 0, value: 0 }),
  },
  {
    type: "MATCH_TAGS_DIFFERENCE",
    label: "Tag difference",
    group: "Match",
    fields: [{ kind: "tag-id-value", keys: ["id", "value"] }],
    defaults: () => ({ id: 0, value: 0 }),
  },
];

export const RULE_TYPES: RuleTypeMeta[] = [...ACTIONS, ...MATCHES];

export const RULE_TYPE_MAP: Record<string, RuleTypeMeta | undefined> = Object.fromEntries(
  RULE_TYPES.map((r) => [r.type, r]),
);

export function makeRule(type: string): Rule {
  const meta = RULE_TYPE_MAP[type];
  return { type, ...(meta?.defaults?.() ?? {}) };
}

export const IP_PROTOCOLS: { value: number; label: string }[] = [
  { value: 1, label: "ICMP (1)" },
  { value: 2, label: "IGMP (2)" },
  { value: 6, label: "TCP (6)" },
  { value: 17, label: "UDP (17)" },
  { value: 50, label: "ESP (50)" },
  { value: 51, label: "AH (51)" },
  { value: 58, label: "ICMPv6 (58)" },
  { value: 89, label: "OSPF (89)" },
  { value: 132, label: "SCTP (132)" },
];

export const ETHERTYPES: { value: number; label: string }[] = [
  { value: 0x0800, label: "IPv4 (0x0800)" },
  { value: 0x0806, label: "ARP (0x0806)" },
  { value: 0x86dd, label: "IPv6 (0x86dd)" },
  { value: 0x8100, label: "VLAN (0x8100)" },
];
