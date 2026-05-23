export interface NodeStatus {
  address: string;
  publicIdentity?: string;
  online?: boolean;
  tcpFallbackActive?: boolean;
  versionMajor?: number;
  versionMinor?: number;
  versionRev?: number;
  version?: string;
  clock?: number;
  [extra: string]: unknown;
}

export interface ControllerStatus {
  controller: boolean;
  apiVersion?: number;
  clock?: number;
  databaseReady?: boolean;
  [extra: string]: unknown;
}

export interface IpAssignmentPool {
  ipRangeStart: string;
  ipRangeEnd: string;
}

export interface Route {
  target: string;
  via?: string | null;
  flags?: number;
  metric?: number;
}

export interface Dns {
  domain: string;
  servers: string[];
}

// The controller serializes "no DNS" as `[]` instead of an object — normalize at boundaries.
export type DnsRaw = Dns | unknown[] | null | undefined;

export function normalizeDns(raw: DnsRaw): Dns {
  if (raw && !Array.isArray(raw) && typeof raw === "object") {
    const obj = raw as Partial<Dns>;
    return {
      domain: typeof obj.domain === "string" ? obj.domain : "",
      servers: Array.isArray(obj.servers)
        ? obj.servers.filter((s): s is string => typeof s === "string")
        : [],
    };
  }
  return { domain: "", servers: [] };
}

export function dnsForSave(dns: Dns): Dns | [] {
  // Send back `[]` when fully empty to match controller's own representation.
  if (!dns.domain && dns.servers.length === 0) return [];
  return dns;
}

export interface V4AssignMode {
  zt: boolean;
}

export interface V6AssignMode {
  zt: boolean;
  "6plane": boolean;
  rfc4193: boolean;
}

export interface Tag {
  id: number;
  default?: number | null;
}

export interface Capability {
  id: number;
  default?: boolean;
  rules: Rule[];
}

export type Rule = {
  type: string;
  not?: boolean;
  or?: boolean;
  // type-specific fields are forwarded as-is so unknown rule types survive a round-trip
  [extra: string]: unknown;
};

export interface Network {
  id: string;
  nwid?: string;
  name?: string;
  private?: boolean;
  enableBroadcast?: boolean;
  multicastLimit?: number;
  mtu?: number;
  v4AssignMode?: V4AssignMode;
  v6AssignMode?: V6AssignMode;
  ipAssignmentPools?: IpAssignmentPool[];
  routes?: Route[];
  rules?: Rule[];
  capabilities?: Capability[];
  tags?: Tag[];
  dns?: DnsRaw;
  remoteTraceTarget?: string | null;
  remoteTraceLevel?: number;
  creationTime?: number;
  revision?: number;
  objtype?: string;
  rulesSource?: string;
  ssoEnabled?: boolean;
  clientId?: string;
  authorizationEndpoint?: string;
  authTokens?: unknown[];
  meta?: { authorizedMemberCount?: number; totalMemberCount?: number };
  [extra: string]: unknown;
}

export interface Member {
  id: string;
  address?: string;
  nwid?: string;
  name?: string;
  authorized?: boolean;
  activeBridge?: boolean;
  noAutoAssignIps?: boolean;
  ipAssignments?: string[];
  tags?: [number, number][];
  capabilities?: number[];
  vMajor?: number;
  vMinor?: number;
  vRev?: number;
  vProto?: number;
  lastAuthorizedTime?: number;
  lastDeauthorizedTime?: number;
  creationTime?: number;
  identity?: string;
  revision?: number;
  remoteTraceTarget?: string | null;
  remoteTraceLevel?: number;
  [extra: string]: unknown;
}

export type MemberRevMap = Record<string, number>;

export interface PeerPath {
  address: string;
  active: boolean;
  expired: boolean;
  preferred: boolean;
  lastSend?: number;
  lastReceive?: number;
  localPort?: number;
  localSocket?: number;
  trustedPathId?: number;
}

export interface Peer {
  address: string;
  role?: "LEAF" | "PLANET" | "MOON" | string;
  latency?: number;
  isBonded?: boolean;
  tunneled?: boolean;
  version?: string;
  versionMajor?: number;
  versionMinor?: number;
  versionRev?: number;
  paths?: PeerPath[];
  [extra: string]: unknown;
}

export interface UnstableNetworkMeta {
  authorizedMemberCount?: number;
  totalMemberCount?: number;
}

export interface UnstableNetworkListResponse {
  data: (Network & { meta?: UnstableNetworkMeta })[];
  meta: { networkCount: number };
}
