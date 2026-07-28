import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import type { MemberAccount } from '@/shared/types/member';
import { axiosClient } from './axiosClient';

export const memberApi = {
  /** 전체 회원 계정 — 로그인(계정 선택) 모달용 */
  getMembers: async (): Promise<MemberAccount[]> => {
    const { data } = await axiosClient.get<MemberAccount[]>('/members', {
      skipErrorToast: true,
    });
    return data;
  },
};

export const useMembersQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.members,
    queryFn: memberApi.getMembers,
    enabled,
  });
