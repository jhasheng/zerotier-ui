import { useQuery } from "@tanstack/react-query";
import { getPeer, listPeers } from "@/api/peers";

export const PEERS_KEY = ["peers"] as const;
export const peerKey = (address: string) => ["peer", address] as const;

export function usePeers(refetchMs = 5000) {
  return useQuery({
    queryKey: PEERS_KEY,
    queryFn: () => listPeers(),
    refetchInterval: refetchMs,
  });
}

export function usePeer(address: string | undefined) {
  return useQuery({
    queryKey: address ? peerKey(address) : ["peer", "missing"],
    queryFn: () => getPeer(address!),
    enabled: Boolean(address),
  });
}
