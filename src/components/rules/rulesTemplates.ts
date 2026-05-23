import type { Rule } from "@/api/types";

export interface RuleTemplate {
  id: string;
  label: string;
  description: string;
  rules: Rule[];
}

export const RULE_TEMPLATES: RuleTemplate[] = [
  {
    id: "allow-all",
    label: "Allow all (default)",
    description: "Accept every packet. Simplest policy, no filtering.",
    rules: [{ type: "ACTION_ACCEPT" }],
  },
  {
    id: "drop-all",
    label: "Drop all",
    description: "Reject every packet. Combine with allowlists.",
    rules: [{ type: "ACTION_DROP" }],
  },
  {
    id: "allow-ipv4-arp",
    label: "Allow IPv4 + ARP, drop the rest",
    description: "Common base for an IPv4-only LAN.",
    rules: [
      { type: "MATCH_ETHERTYPE", not: true, or: false, etherType: 0x0800 },
      { type: "MATCH_ETHERTYPE", not: true, or: true, etherType: 0x0806 },
      { type: "ACTION_DROP" },
      { type: "ACTION_ACCEPT" },
    ],
  },
  {
    id: "tcp-established",
    label: "Allow established TCP",
    description:
      "Pass IPv4 frames; SSH inbound only from a tagged group (sample of MATCH_TAG_SENDER).",
    rules: [
      { type: "MATCH_ETHERTYPE", etherType: 0x0800 },
      { type: "MATCH_IP_PROTOCOL", ipProtocol: 6 },
      { type: "ACTION_ACCEPT" },
      { type: "ACTION_DROP" },
    ],
  },
  {
    id: "block-icmp",
    label: "Block ICMP",
    description: "Drop ICMP echo; allow everything else.",
    rules: [
      { type: "MATCH_ETHERTYPE", etherType: 0x0800 },
      { type: "MATCH_IP_PROTOCOL", ipProtocol: 1 },
      { type: "ACTION_DROP" },
      { type: "ACTION_ACCEPT" },
    ],
  },
];
