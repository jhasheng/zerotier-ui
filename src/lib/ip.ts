export interface ParsedCidrV4 {
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  prefix: number;
}

export function parseIpv4(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    const v = Number(p);
    if (!Number.isInteger(v) || v < 0 || v > 255) return null;
    n = (n << 8) + v;
  }
  return n >>> 0;
}

export function formatIpv4(n: number): string {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff].join(
    ".",
  );
}

export function parseCidrV4(cidr: string): ParsedCidrV4 | null {
  const [ipPart, prefixPart] = cidr.split("/");
  if (!ipPart || !prefixPart) return null;
  const ip = parseIpv4(ipPart);
  const prefix = Number(prefixPart);
  if (ip === null || !Number.isInteger(prefix) || prefix < 0 || prefix > 32)
    return null;
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  const network = (ip & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const firstHost = prefix >= 31 ? network : (network + 1) >>> 0;
  const lastHost = prefix >= 31 ? broadcast : (broadcast - 1) >>> 0;
  return {
    network: formatIpv4(network),
    broadcast: formatIpv4(broadcast),
    firstHost: formatIpv4(firstHost),
    lastHost: formatIpv4(lastHost),
    prefix,
  };
}

export function suggestPoolFromCidr(
  cidr: string,
): { ipRangeStart: string; ipRangeEnd: string } | null {
  const parsed = parseCidrV4(cidr);
  if (!parsed) return null;
  return { ipRangeStart: parsed.firstHost, ipRangeEnd: parsed.lastHost };
}

const PRIVATE_PREFIXES = ["10.", "172.", "192.168.", "100.64."];
const SUGGEST_CIDRS = [
  "10.147.17.0/24",
  "10.147.18.0/24",
  "10.147.19.0/24",
  "10.147.20.0/24",
  "10.243.0.0/24",
  "172.22.0.0/24",
  "192.168.193.0/24",
];

export function randomPrivateCidr(): string {
  return SUGGEST_CIDRS[Math.floor(Math.random() * SUGGEST_CIDRS.length)]!;
}

export function looksPrivate(ip: string): boolean {
  return PRIVATE_PREFIXES.some((p) => ip.startsWith(p));
}
