import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import type { Club, ClubMember } from '@/shared/types/club';
import { axiosClient } from './axiosClient';

// 조회 실패는 화면 단위 에러 뷰로 보여주므로 전역 토스트는 끈다
export const clubApi = {
  getClubs: async (): Promise<Club[]> => {
    const { data } = await axiosClient.get<Club[]>('/clubs', {
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

export const useClubsQuery = () =>
  useQuery({ queryKey: queryKeys.clubs, queryFn: clubApi.getClubs });

export const useClubMembersQuery = (clubPublicId?: string) =>
  useQuery({
    queryKey: queryKeys.clubMembers(clubPublicId ?? ''),
    queryFn: () => clubApi.getMembers(clubPublicId as string),
    enabled: Boolean(clubPublicId),
  });
