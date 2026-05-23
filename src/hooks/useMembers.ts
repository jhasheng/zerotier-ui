import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  deleteMember,
  fetchMembersDetailed,
  getMember,
  listMemberRevs,
  upsertMember,
} from "@/api/members";
import type { Member } from "@/api/types";

export const membersKey = (nwid: string) => ["members", nwid] as const;
export const memberKey = (nwid: string, memberId: string) =>
  ["member", nwid, memberId] as const;

export function useMemberIds(nwid: string | undefined) {
  return useQuery({
    queryKey: nwid ? membersKey(nwid) : ["members", "missing"],
    queryFn: async () => {
      const map = await listMemberRevs(nwid!);
      return Object.keys(map);
    },
    enabled: Boolean(nwid),
  });
}

export function useMembersDetailed(nwid: string | undefined) {
  return useQuery({
    queryKey: nwid ? ["members-detailed", nwid] : ["members-detailed", "missing"],
    queryFn: async () => {
      const map = await listMemberRevs(nwid!);
      const ids = Object.keys(map);
      return fetchMembersDetailed(nwid!, ids);
    },
    enabled: Boolean(nwid),
    staleTime: 5_000,
  });
}

export function useMember(nwid: string | undefined, memberId: string | undefined) {
  return useQuery({
    queryKey:
      nwid && memberId ? memberKey(nwid, memberId) : ["member", "missing"],
    queryFn: () => getMember(nwid!, memberId!),
    enabled: Boolean(nwid && memberId),
  });
}

export function useUpsertMember(nwid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { memberId: string; patch: Partial<Member> }) =>
      upsertMember(nwid, vars.memberId, vars.patch),
    onSuccess: (data, vars) => {
      qc.setQueryData(memberKey(nwid, vars.memberId), data);
      qc.invalidateQueries({ queryKey: ["members-detailed", nwid] });
      qc.invalidateQueries({ queryKey: membersKey(nwid) });
    },
  });
}

export function useDeleteMember(nwid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => deleteMember(nwid, memberId),
    onSuccess: (_d, memberId) => {
      qc.removeQueries({ queryKey: memberKey(nwid, memberId) });
      qc.invalidateQueries({ queryKey: ["members-detailed", nwid] });
      qc.invalidateQueries({ queryKey: membersKey(nwid) });
    },
  });
}
