import { useQuery } from "@tanstack/react-query";
import { getController, getStatus } from "@/api/status";

export function useNodeStatus(refetchMs = 5000) {
  return useQuery({
    queryKey: ["node-status"],
    queryFn: () => getStatus(),
    refetchInterval: refetchMs,
  });
}

export function useControllerStatus() {
  return useQuery({
    queryKey: ["controller-status"],
    queryFn: () => getController(),
  });
}
