import { api } from "./client";
import { E } from "./endpoints";
import type { Peer } from "./types";

export function listPeers(): Promise<Peer[]> {
  return api.get<Peer[]>(E.peers());
}

export function getPeer(address: string): Promise<Peer> {
  return api.get<Peer>(E.peer(address));
}
