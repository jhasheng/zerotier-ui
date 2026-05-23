import { api } from "./client";
import { E } from "./endpoints";
import type { Member, MemberRevMap } from "./types";

export function listMemberRevs(nwid: string): Promise<MemberRevMap> {
  return api.get<MemberRevMap>(E.members(nwid));
}

export function getMember(nwid: string, memberId: string): Promise<Member> {
  return api.get<Member>(E.member(nwid, memberId));
}

export function upsertMember(
  nwid: string,
  memberId: string,
  patch: Partial<Member>,
): Promise<Member> {
  return api.post<Member>(E.member(nwid, memberId), patch);
}

export function deleteMember(nwid: string, memberId: string): Promise<Member> {
  return api.del<Member>(E.member(nwid, memberId));
}

const MEMBER_CONCURRENCY = 6;

export async function fetchMembersDetailed(
  nwid: string,
  ids: string[],
): Promise<Member[]> {
  const result: Member[] = [];
  let cursor = 0;
  const workers = Array.from(
    { length: Math.min(MEMBER_CONCURRENCY, ids.length) },
    async () => {
      while (cursor < ids.length) {
        const i = cursor++;
        const id = ids[i]!;
        try {
          const m = await getMember(nwid, id);
          result.push(m);
        } catch {
          // Skip individual failures; partial results are still useful
        }
      }
    },
  );
  await Promise.all(workers);
  return result;
}
