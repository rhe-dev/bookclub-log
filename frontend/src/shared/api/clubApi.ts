import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import type { ClubMember, MyClub } from '@/shared/types/club';
import { axiosClient } from './axiosClient';

// 조회 실패는 화면 단위 에러 뷰로 보여주므로 전역 토스트는 끈다
const clubApi = {
  getMyClubs: async (): Promise<MyClub[]> => {
    const { data } = await axiosClient.get<MyClub[]>('/clubs/mine', {
      skipErrorToast: true,
    });
    return data;
  },
  getMembers: async (clubPublicId: string): Promise<ClubMember[]> => {
    const { data } = await axiosClient.get<ClubMember[]>(
      `/clubs/${clubPublicId}/members`,
      { skipErrorToast: true },
    );
    return data;
  },
};

/** 내가 가입한 클럽 목록 — GNB 클럽 변경·마이페이지 프로필용 */
export const useMyClubsQuery = (memberPublicId?: string) =>
  useQuery({
    queryKey: queryKeys.clubsMine(memberPublicId ?? ''),
    queryFn: clubApi.getMyClubs,
    enabled: Boolean(memberPublicId),
  });

export const useClubMembersQuery = (clubPublicId?: string) =>
  useQuery({
    queryKey: queryKeys.clubMembers(clubPublicId ?? ''),
    queryFn: () => clubApi.getMembers(clubPublicId as string),
    enabled: Boolean(clubPublicId),
  });
