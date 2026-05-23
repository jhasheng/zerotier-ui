import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createNetwork,
  deleteNetwork,
  getNetwork,
  listNetworkIds,
  listNetworksUnstable,
  updateNetwork,
} from "@/api/networks";
import type { Network } from "@/api/types";

export const NETWORKS_KEY = ["networks"] as const;
export const networkKey = (nwid: string) => ["network", nwid] as const;

export function useNetworkIds() {
  return useQuery({
    queryKey: NETWORKS_KEY,
    queryFn: () => listNetworkIds(),
  });
}

export function useNetwork(nwid: string | undefined) {
  return useQuery({
    queryKey: nwid ? networkKey(nwid) : ["network", "missing"],
    queryFn: () => getNetwork(nwid!),
    enabled: Boolean(nwid),
  });
}

export function useNetworksDetails(ids: string[] | undefined) {
  return useQuery({
    queryKey: ["networks-details", ids?.join(",") ?? ""],
    queryFn: async () => {
      if (!ids || ids.length === 0) return [] as Network[];
      const results = await Promise.allSettled(ids.map((id) => getNetwork(id)));
      return results
        .filter((r): r is PromiseFulfilledResult<Network> => r.status === "fulfilled")
        .map((r) => r.value);
    },
    enabled: Boolean(ids),
  });
}

// Single round-trip alternative that also returns authorized/total member counts per network.
export function useNetworksUnstable() {
  return useQuery({
    queryKey: ["networks-unstable"],
    queryFn: () => listNetworksUnstable(),
    staleTime: 5_000,
  });
}

export function useCreateNetwork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { nodeAddress: string; init: Partial<Network> }) =>
      createNetwork(vars.nodeAddress, vars.init),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NETWORKS_KEY });
      qc.invalidateQueries({ queryKey: ["networks-details"] });
    },
  });
}

export function useUpdateNetwork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { nwid: string; patch: Partial<Network> }) =>
      updateNetwork(vars.nwid, vars.patch),
    onSuccess: (data, vars) => {
      qc.setQueryData(networkKey(vars.nwid), data);
      qc.invalidateQueries({ queryKey: ["networks-details"] });
    },
  });
}

export function useDeleteNetwork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (nwid: string) => deleteNetwork(nwid),
    onSuccess: (_d, nwid) => {
      qc.removeQueries({ queryKey: networkKey(nwid) });
      qc.invalidateQueries({ queryKey: NETWORKS_KEY });
      qc.invalidateQueries({ queryKey: ["networks-details"] });
    },
  });
}
