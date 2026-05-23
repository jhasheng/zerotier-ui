import { api } from "./client";
import { E } from "./endpoints";
import type { Network, UnstableNetworkListResponse } from "./types";

export function listNetworkIds(): Promise<string[]> {
  return api.get<string[]>(E.networks());
}

export function getNetwork(nwid: string): Promise<Network> {
  return api.get<Network>(E.network(nwid));
}

export function createNetwork(
  nodeAddress: string,
  init: Partial<Network>,
): Promise<Network> {
  return api.post<Network>(E.newNetwork(nodeAddress), init);
}

export function updateNetwork(
  nwid: string,
  patch: Partial<Network>,
): Promise<Network> {
  return api.post<Network>(E.network(nwid), patch);
}

export function deleteNetwork(nwid: string): Promise<Network> {
  return api.del<Network>(E.network(nwid));
}

export function listNetworksUnstable(): Promise<UnstableNetworkListResponse> {
  return api.get<UnstableNetworkListResponse>(E.unstableNetworks());
}
