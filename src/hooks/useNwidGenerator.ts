import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getStatus } from "@/api/status";
import { useCreateNetwork } from "@/hooks/useNetworks";
import { randomPrivateCidr, parseCidrV4 } from "@/lib/ip";
import type { Network } from "@/api/types";

export interface NewNetworkInit {
  name: string;
  cidr?: string;
}

export function useNwidGenerator() {
  const qc = useQueryClient();
  const createMut = useCreateNetwork();

  const create = useCallback(
    async (init: NewNetworkInit): Promise<Network> => {
      const cached = qc.getQueryData<{ address?: string }>(["node-status"]);
      let address = cached?.address;
      if (!address) {
        const s = await getStatus();
        address = s.address;
        qc.setQueryData(["node-status"], s);
      }
      if (!address || !/^[0-9a-fA-F]{10}$/.test(address)) {
        throw new Error("Controller node address unavailable");
      }
      const cidr = init.cidr ?? randomPrivateCidr();
      const parsed = parseCidrV4(cidr);
      const body: Partial<Network> = {
        name: init.name,
        private: true,
        enableBroadcast: true,
        multicastLimit: 32,
        mtu: 2800,
        v4AssignMode: { zt: true },
        v6AssignMode: { zt: false, "6plane": false, rfc4193: false },
        ipAssignmentPools: parsed
          ? [{ ipRangeStart: parsed.firstHost, ipRangeEnd: parsed.lastHost }]
          : [],
        routes: parsed ? [{ target: cidr, via: null }] : [],
        rules: [{ type: "ACTION_ACCEPT" }],
      };
      return createMut.mutateAsync({ nodeAddress: address, init: body });
    },
    [qc, createMut],
  );

  return { create, isCreating: createMut.isPending };
}
