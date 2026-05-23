export const E = {
  status: () => "/status",
  controller: () => "/controller",
  networks: () => "/controller/network",
  network: (nwid: string) => `/controller/network/${nwid}`,
  newNetwork: (nodeAddress: string) =>
    `/controller/network/${nodeAddress}______`,
  members: (nwid: string) => `/controller/network/${nwid}/member`,
  member: (nwid: string, memberId: string) =>
    `/controller/network/${nwid}/member/${memberId}`,
  peers: () => "/peer",
  peer: (address: string) => `/peer/${address}`,
  unstableNetworks: () => "/unstable/controller/network",
  unstableNetwork: (nwid: string) => `/unstable/controller/network/${nwid}`,
  unstableMembers: (nwid: string) =>
    `/unstable/controller/network/${nwid}/member`,
} as const;
